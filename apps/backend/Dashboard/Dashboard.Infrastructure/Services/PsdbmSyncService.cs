using ERPEZ.Application.Features.Planning.Psdbm.Dtos;
using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Collections.Concurrent;
using System.Text.Json;

namespace ERPEZ.Infrastructure.Services;

public class PsdbmSyncService(
    ApplicationDbContext dbContext,
    IPhilGepsService philGepsService,
    ILogger<PsdbmSyncService> logger) : IPsdbmSyncService
{
    public async Task<PsdbmSyncResultDto> SyncAsync(
        PsdbmSyncRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var syncRun = new PsdbmSyncRun
        {
            StartedAt = DateTime.UtcNow,
            Status = PsdbmSyncStatus.Running,
            SyncMode = request.SyncMode
        };

        dbContext.PsdbmSyncRuns?.Add(syncRun);
        await dbContext.SaveChangesAsync(cancellationToken);

        var errors = new ConcurrentBag<PsdbmSyncItemErrorDto>();
        var itemsDiscoveredCount = 0;
        var itemsCreatedCount = 0;
        var itemsUpdatedCount = 0;
        var stockRecordsUpdatedCount = 0;
        var depotsProcessedCount = 0;

        try
        {
            logger.LogInformation("Starting PSDBM Sync Run {SyncRunId} (Mode: {SyncMode})", syncRun.Id, request.SyncMode);

            // Step 1: Ensure regional and LGU depots are populated/synced
            var activeDepots = await EnsureDepotsSynchronizedAsync(cancellationToken);

            // Filter depots based on request
            var targetDepots = activeDepots;
            if (request.Depots != null && request.Depots.Count > 0)
            {
                var depotFilterSet = request.Depots.ToHashSet(StringComparer.OrdinalIgnoreCase);
                targetDepots = activeDepots.Where(d => depotFilterSet.Contains(d.Name)).ToList();
            }

            if (!string.IsNullOrWhiteSpace(request.Mode))
            {
                targetDepots = targetDepots.Where(d => d.Mode.Equals(request.Mode, StringComparison.OrdinalIgnoreCase)).ToList();
            }

            logger.LogInformation("Processing {DepotCount} target depots for PSDBM synchronization", targetDepots.Count);

            // Step 2: Iterate through each depot
            foreach (var depot in targetDepots)
            {
                if (cancellationToken.IsCancellationRequested) break;

                try
                {
                    logger.LogInformation("Fetching catalogue items for depot {DepotName} (Mode: {DepotMode})", depot.Name, depot.Mode);

                    var catalogueItems = await philGepsService.GetItemsAsync(
                        mode: depot.Mode,
                        search: null,
                        category: "All",
                        max: 500,
                        depot: depot.Name,
                        cancellationToken: cancellationToken);

                    if (!string.IsNullOrWhiteSpace(request.ItemCodeFilter))
                    {
                        catalogueItems = catalogueItems
                            .Where(i => i.ItemCode.Contains(request.ItemCodeFilter, StringComparison.OrdinalIgnoreCase))
                            .ToList();
                    }

                    Interlocked.Add(ref itemsDiscoveredCount, catalogueItems.Count);

                    // Step 3: Fetch detail & stocks with controlled concurrency
                    var maxConcurrency = Math.Max(1, Math.Min(request.MaxConcurrency, 10));
                    using var throttler = new SemaphoreSlim(maxConcurrency, maxConcurrency);

                    var detailTasks = catalogueItems.Select(async item =>
                    {
                        await throttler.WaitAsync(cancellationToken);
                        try
                        {
                            var details = await philGepsService.GetItemDetailsAsync(
                                itemCode: item.ItemCode,
                                depot: depot.Name,
                                category: "All",
                                mode: depot.Mode,
                                cancellationToken: cancellationToken);

                            return (Item: item, Details: details, Error: (string?)null);
                        }
                        catch (Exception ex)
                        {
                            logger.LogWarning(ex, "Failed to fetch item details for {ItemCode} at depot {DepotName}", item.ItemCode, depot.Name);
                            errors.Add(new PsdbmSyncItemErrorDto
                            {
                                ItemCode = item.ItemCode,
                                Depot = depot.Name,
                                ErrorMessage = ex.Message
                            });
                            return (Item: item, Details: (PsdbmItemDetailsDto?)null, Error: ex.Message);
                        }
                        finally
                        {
                            throttler.Release();
                        }
                    });

                    var detailResults = await Task.WhenAll(detailTasks);

                    // Step 4: Process and upsert products and depot stocks
                    foreach (var (item, details, _) in detailResults)
                    {
                        if (details == null) continue;

                        try
                        {
                            var itemCode = details.ItemCode;
                            if (string.IsNullOrWhiteSpace(itemCode)) itemCode = item.ItemCode;

                            // 4a. Find or create master product
                            var product = await dbContext.PsdbmProducts!
                                .FirstOrDefaultAsync(p => p.ItemCode == itemCode, cancellationToken);

                            var isNewProduct = product == null;
                            if (isNewProduct)
                            {
                                product = new PsdbmProduct
                                {
                                    ItemCode = itemCode,
                                    Description = string.IsNullOrWhiteSpace(details.Description) ? item.Description : details.Description,
                                    Category = string.IsNullOrWhiteSpace(details.Category) ? "General" : details.Category,
                                    Unit = string.IsNullOrWhiteSpace(details.Unit) ? item.Unit : details.Unit,
                                    ImageUrl = details.ImageUrl,
                                    TechnicalSpecificationUrl = details.TechnicalSpecificationUrl,
                                    IsActive = true
                                };
                                dbContext.PsdbmProducts!.Add(product);
                                Interlocked.Increment(ref itemsCreatedCount);
                            }
                            else if (request.SyncMode is PsdbmSyncMode.Full or PsdbmSyncMode.Product)
                            {
                                if (!string.IsNullOrWhiteSpace(details.Description)) product!.Description = details.Description;
                                if (!string.IsNullOrWhiteSpace(details.Category)) product!.Category = details.Category;
                                if (!string.IsNullOrWhiteSpace(details.Unit)) product!.Unit = details.Unit;
                                if (!string.IsNullOrWhiteSpace(details.ImageUrl)) product!.ImageUrl = details.ImageUrl;
                                if (!string.IsNullOrWhiteSpace(details.TechnicalSpecificationUrl)) product!.TechnicalSpecificationUrl = details.TechnicalSpecificationUrl;
                                product!.IsActive = true;
                                Interlocked.Increment(ref itemsUpdatedCount);
                            }

                            // Ensure product has a valid ID before depot product association
                            if (product!.Id == Guid.Empty)
                            {
                                product.Id = Guid.NewGuid();
                            }

                            // 4b. Find or create DepotProduct
                            var depotProduct = await dbContext.PsdbmDepotProducts!
                                .FirstOrDefaultAsync(dp => dp.ProductId == product.Id && dp.DepotId == depot.Id, cancellationToken);

                            var effectivePrice = details.UnitPrice > 0 ? details.UnitPrice : item.UnitPrice;
                            var effectiveAvailability = !string.IsNullOrWhiteSpace(details.Status) ? details.Status : item.Availability;

                            var hasStockOrPriceChanged = depotProduct == null ||
                                                         depotProduct.AvailableStock != details.AvailableStock ||
                                                         depotProduct.RemainingQtyForDelivery != details.RemainingQtyForDelivery ||
                                                         depotProduct.Price != effectivePrice ||
                                                         depotProduct.Availability != effectiveAvailability;

                            if (depotProduct == null)
                            {
                                depotProduct = new PsdbmDepotProduct
                                {
                                    Id = Guid.NewGuid(),
                                    ProductId = product.Id,
                                    Product = product,
                                    DepotId = depot.Id,
                                    Depot = depot,
                                    Price = effectivePrice,
                                    Availability = effectiveAvailability,
                                    AvailableStock = details.AvailableStock,
                                    RemainingQtyForDelivery = details.RemainingQtyForDelivery,
                                    LastSyncedAt = DateTime.UtcNow
                                };
                                dbContext.PsdbmDepotProducts!.Add(depotProduct);
                            }
                            else
                            {
                                depotProduct.Price = effectivePrice;
                                depotProduct.Availability = effectiveAvailability;
                                depotProduct.AvailableStock = details.AvailableStock;
                                depotProduct.RemainingQtyForDelivery = details.RemainingQtyForDelivery;
                                depotProduct.LastSyncedAt = DateTime.UtcNow;
                            }

                            // 4c. Record Stock History snapshot when changes occur or first sync
                            if (hasStockOrPriceChanged && request.SyncMode is PsdbmSyncMode.Full or PsdbmSyncMode.Stock)
                            {
                                var stockHistory = new PsdbmStockHistory
                                {
                                    DepotProductId = depotProduct.Id,
                                    DepotProduct = depotProduct,
                                    AvailableStock = details.AvailableStock,
                                    RemainingQtyForDelivery = details.RemainingQtyForDelivery,
                                    Price = effectivePrice,
                                    Availability = effectiveAvailability,
                                    CapturedAt = DateTime.UtcNow,
                                    SyncRunId = syncRun.Id
                                };
                                dbContext.PsdbmStockHistories!.Add(stockHistory);
                                Interlocked.Increment(ref stockRecordsUpdatedCount);
                            }
                        }
                        catch (Exception itemEx)
                        {
                            logger.LogWarning(itemEx, "Error persisting product {ItemCode} at depot {DepotName}", item.ItemCode, depot.Name);
                            errors.Add(new PsdbmSyncItemErrorDto
                            {
                                ItemCode = item.ItemCode,
                                Depot = depot.Name,
                                ErrorMessage = itemEx.Message
                            });
                        }
                    }

                    // Save changes per depot
                    await dbContext.SaveChangesAsync(cancellationToken);
                    Interlocked.Increment(ref depotsProcessedCount);
                }
                catch (Exception depotEx)
                {
                    logger.LogError(depotEx, "Error synchronizing depot {DepotName}", depot.Name);
                    errors.Add(new PsdbmSyncItemErrorDto
                    {
                        ItemCode = "DEPOT_LEVEL_ERROR",
                        Depot = depot.Name,
                        ErrorMessage = depotEx.Message
                    });
                }
            }

            // Step 5: Finalize SyncRun
            syncRun.CompletedAt = DateTime.UtcNow;
            syncRun.DepotsProcessed = depotsProcessedCount;
            syncRun.ItemsDiscovered = itemsDiscoveredCount;
            syncRun.ItemsCreated = itemsCreatedCount;
            syncRun.ItemsUpdated = itemsUpdatedCount;
            syncRun.StockRecordsUpdated = stockRecordsUpdatedCount;

            var errorList = errors.ToList();
            if (errorList.Count > 0)
            {
                syncRun.Status = PsdbmSyncStatus.CompletedWithErrors;
                syncRun.Errors = JsonSerializer.Serialize(errorList.Take(100)); // Cap serialized errors
            }
            else
            {
                syncRun.Status = PsdbmSyncStatus.Completed;
            }

            await dbContext.SaveChangesAsync(cancellationToken);

            logger.LogInformation("PSDBM Sync Run {SyncRunId} finished with status {Status}. Items Created: {Created}, Updated: {Updated}, Stock Records: {StockRecords}",
                syncRun.Id, syncRun.Status, itemsCreatedCount, itemsUpdatedCount, stockRecordsUpdatedCount);

            return new PsdbmSyncResultDto
            {
                SyncRunId = syncRun.Id,
                Status = syncRun.Status,
                SyncMode = syncRun.SyncMode,
                StartedAt = syncRun.StartedAt,
                CompletedAt = syncRun.CompletedAt,
                DepotsProcessed = depotsProcessedCount,
                ItemsDiscovered = itemsDiscoveredCount,
                ItemsCreated = itemsCreatedCount,
                ItemsUpdated = itemsUpdatedCount,
                StockRecordsUpdated = stockRecordsUpdatedCount,
                ErrorCount = errorList.Count,
                Errors = errorList
            };
        }
        catch (Exception fatalEx)
        {
            logger.LogCritical(fatalEx, "Fatal error during PSDBM synchronization run {SyncRunId}", syncRun.Id);

            syncRun.CompletedAt = DateTime.UtcNow;
            syncRun.Status = PsdbmSyncStatus.Failed;
            syncRun.Errors = fatalEx.ToString();

            try
            {
                await dbContext.SaveChangesAsync(CancellationToken.None);
            }
            catch { /* Best effort save */ }

            return new PsdbmSyncResultDto
            {
                SyncRunId = syncRun.Id,
                Status = PsdbmSyncStatus.Failed,
                SyncMode = syncRun.SyncMode,
                StartedAt = syncRun.StartedAt,
                CompletedAt = syncRun.CompletedAt,
                DepotsProcessed = depotsProcessedCount,
                ItemsDiscovered = itemsDiscoveredCount,
                ItemsCreated = itemsCreatedCount,
                ItemsUpdated = itemsUpdatedCount,
                StockRecordsUpdated = stockRecordsUpdatedCount,
                ErrorCount = errors.Count + 1,
                Errors = errors.ToList()
            };
        }
    }

    public Task<PsdbmSyncResultDto> SyncDepotAsync(
        string depotName,
        string mode = "regional",
        PsdbmSyncMode syncMode = PsdbmSyncMode.Full,
        CancellationToken cancellationToken = default)
    {
        return SyncAsync(new PsdbmSyncRequestDto
        {
            Depots = [depotName],
            Mode = mode,
            SyncMode = syncMode
        }, cancellationToken);
    }

    public async Task<PsdbmSyncRunDto?> GetSyncRunAsync(
        Guid syncRunId,
        CancellationToken cancellationToken = default)
    {
        var run = await dbContext.PsdbmSyncRuns!
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == syncRunId, cancellationToken);

        if (run == null) return null;

        return new PsdbmSyncRunDto
        {
            Id = run.Id,
            StartedAt = run.StartedAt,
            CompletedAt = run.CompletedAt,
            Status = run.Status,
            SyncMode = run.SyncMode,
            DepotsProcessed = run.DepotsProcessed,
            ItemsDiscovered = run.ItemsDiscovered,
            ItemsCreated = run.ItemsCreated,
            ItemsUpdated = run.ItemsUpdated,
            StockRecordsUpdated = run.StockRecordsUpdated,
            Errors = run.Errors
        };
    }

    public async Task<List<PsdbmSyncRunDto>> GetSyncRunsAsync(
        int count = 20,
        CancellationToken cancellationToken = default)
    {
        var safeCount = Math.Max(1, Math.Min(count, 100));

        var runs = await dbContext.PsdbmSyncRuns!
            .AsNoTracking()
            .OrderByDescending(r => r.StartedAt)
            .Take(safeCount)
            .ToListAsync(cancellationToken);

        return runs.Select(run => new PsdbmSyncRunDto
        {
            Id = run.Id,
            StartedAt = run.StartedAt,
            CompletedAt = run.CompletedAt,
            Status = run.Status,
            SyncMode = run.SyncMode,
            DepotsProcessed = run.DepotsProcessed,
            ItemsDiscovered = run.ItemsDiscovered,
            ItemsCreated = run.ItemsCreated,
            ItemsUpdated = run.ItemsUpdated,
            StockRecordsUpdated = run.StockRecordsUpdated,
            Errors = run.Errors
        }).ToList();
    }

    // =====================
    // Helper Methods
    // =====================

    private async Task<List<PsdbmDepot>> EnsureDepotsSynchronizedAsync(CancellationToken cancellationToken)
    {
        var regionalDepots = await philGepsService.GetRegionalDepotsAsync(cancellationToken);
        var lguDepots = await philGepsService.GetLguDepotsAsync(cancellationToken);

        var existingDepots = await dbContext.PsdbmDepots!.ToListAsync(cancellationToken);
        var existingLookup = existingDepots.ToDictionary(
            d => $"{d.Mode.ToLowerInvariant()}:{d.Name.ToLowerInvariant()}",
            StringComparer.OrdinalIgnoreCase);

        var hasChanges = false;

        // Upsert Regional
        foreach (var r in regionalDepots)
        {
            var key = $"regional:{r.Name.ToLowerInvariant()}";
            if (!existingLookup.TryGetValue(key, out var existing))
            {
                var newDepot = new PsdbmDepot
                {
                    Name = r.Name,
                    Region = r.Region,
                    SourceValue = r.Name,
                    Mode = "regional",
                    IsActive = true
                };
                dbContext.PsdbmDepots!.Add(newDepot);
                existingLookup[key] = newDepot;
                hasChanges = true;
            }
            else
            {
                if (existing.Region != r.Region || !existing.IsActive)
                {
                    existing.Region = r.Region;
                    existing.IsActive = true;
                    hasChanges = true;
                }
            }
        }

        // Upsert LGU
        foreach (var l in lguDepots)
        {
            var key = $"lgu:{l.Name.ToLowerInvariant()}";
            if (!existingLookup.TryGetValue(key, out var existing))
            {
                var newDepot = new PsdbmDepot
                {
                    Name = l.Name,
                    Region = "LGU",
                    SourceValue = l.Name,
                    Mode = "lgu",
                    IsActive = true
                };
                dbContext.PsdbmDepots!.Add(newDepot);
                existingLookup[key] = newDepot;
                hasChanges = true;
            }
            else
            {
                if (!existing.IsActive)
                {
                    existing.IsActive = true;
                    hasChanges = true;
                }
            }
        }

        if (hasChanges)
        {
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        return existingLookup.Values.Where(d => d.IsActive).ToList();
    }
}

using ERPEZ.Application.Features.Planning.Psdbm.Dtos;
using ERPEZ.Application.Features.Planning.Psdbm.Queries.GetItems;
using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Enums;
using ERPEZ.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ERPEZ.Infrastructure.Services;

public class PsdbmQueryService(
    ApplicationDbContext dbContext,
    IPhilGepsService philGepsService,
    ILogger<PsdbmQueryService> logger) : IPsdbmQueryService
{
    public async Task<GetPsdbmItemsResponse> GetItemsAsync(
        GetPsdbmItemsQuery request,
        CancellationToken cancellationToken = default)
    {
        var normalizedMode = (request.Mode ?? "regional").ToLowerInvariant();
        var hasDbData = dbContext.PsdbmProducts != null && await dbContext.PsdbmProducts.AnyAsync(cancellationToken);

        if (hasDbData)
        {
            logger.LogInformation("Querying PSDBM catalogue from local database (Mode: {Mode}, Depot: {Depot}, Search: {Search}, Category: {Category})",
                request.Mode, request.Depot, request.Search, request.Category);

            List<PsdbmItemDto> items = [];
            var totalCount = 0;
            DateTime? lastSyncTimestamp = null;

            if (!string.IsNullOrWhiteSpace(request.Depot) && normalizedMode != "main")
            {
                var depotName = request.Depot.Trim();
                var depot = await dbContext.PsdbmDepots!
                    .FirstOrDefaultAsync(d => d.Name.ToLower() == depotName.ToLower() && d.Mode.ToLower() == normalizedMode, cancellationToken)
                    ?? await dbContext.PsdbmDepots!
                    .FirstOrDefaultAsync(d => d.Name.ToLower() == depotName.ToLower(), cancellationToken);

                if (depot != null)
                {
                    var query = dbContext.PsdbmDepotProducts!
                        .Include(dp => dp.Product)
                        .Where(dp => dp.DepotId == depot.Id && dp.Product != null && dp.Product.IsActive);

                    if (!string.IsNullOrWhiteSpace(request.Category) && !request.Category.Equals("All", StringComparison.OrdinalIgnoreCase))
                    {
                        query = query.Where(dp => dp.Product!.Category == request.Category);
                    }

                    if (!string.IsNullOrWhiteSpace(request.Search))
                    {
                        var term = request.Search.Trim().ToLower();
                        query = query.Where(dp => dp.Product!.Description.ToLower().Contains(term) ||
                                                  dp.Product!.ItemCode.ToLower().Contains(term));
                    }

                    totalCount = await query.CountAsync(cancellationToken);

                    var maxResults = Math.Max(1, Math.Min(request.Max, 500));
                    var depotProducts = await query
                        .OrderBy(dp => dp.Product!.Description)
                        .Take(maxResults)
                        .ToListAsync(cancellationToken);

                    items = depotProducts.Select(dp => new PsdbmItemDto
                    {
                        Id = dp.Product!.Id,
                        ItemCode = dp.Product.ItemCode,
                        Description = dp.Product.Description,
                        UnitPrice = dp.Price,
                        Unit = dp.Product.Unit,
                        Availability = dp.Availability,
                        Category = dp.Product.Category,
                        AvailableStock = dp.AvailableStock,
                        RemainingQtyForDelivery = dp.RemainingQtyForDelivery,
                        ImageUrl = dp.Product.ImageUrl,
                        TechnicalSpecificationUrl = dp.Product.TechnicalSpecificationUrl,
                        LastSyncedAt = dp.LastSyncedAt,
                        Depot = depot.Name
                    }).ToList();

                    lastSyncTimestamp = depotProducts.Count > 0
                        ? depotProducts.Max(dp => dp.LastSyncedAt)
                        : null;
                }
            }
            else
            {
                // Main catalogue mode / No specific depot
                var query = dbContext.PsdbmProducts!
                    .Where(p => p.IsActive);

                if (!string.IsNullOrWhiteSpace(request.Category) && !request.Category.Equals("All", StringComparison.OrdinalIgnoreCase))
                {
                    query = query.Where(p => p.Category == request.Category);
                }

                if (!string.IsNullOrWhiteSpace(request.Search))
                {
                    var term = request.Search.Trim().ToLower();
                    query = query.Where(p => p.Description.ToLower().Contains(term) ||
                                              p.ItemCode.ToLower().Contains(term));
                }

                totalCount = await query.CountAsync(cancellationToken);

                var maxResults = Math.Max(1, Math.Min(request.Max, 500));
                var products = await query
                    .OrderBy(p => p.Description)
                    .Take(maxResults)
                    .ToListAsync(cancellationToken);

                items = products.Select(p => new PsdbmItemDto
                {
                    Id = p.Id,
                    ItemCode = p.ItemCode,
                    Description = p.Description,
                    UnitPrice = 0,
                    Unit = p.Unit,
                    Availability = "Available",
                    Category = p.Category,
                    AvailableStock = 0,
                    RemainingQtyForDelivery = 0,
                    ImageUrl = p.ImageUrl,
                    TechnicalSpecificationUrl = p.TechnicalSpecificationUrl,
                    LastSyncedAt = p.UpdatedAt ?? p.CreatedAt,
                    Depot = null
                }).ToList();

                lastSyncTimestamp = products.Count > 0
                    ? products.Max(p => p.UpdatedAt ?? p.CreatedAt)
                    : null;
            }

            // Fallback sync timestamp
            if (lastSyncTimestamp == null && dbContext.PsdbmSyncRuns != null)
            {
                lastSyncTimestamp = await dbContext.PsdbmSyncRuns
                    .Where(r => r.Status == PsdbmSyncStatus.Completed || r.Status == PsdbmSyncStatus.CompletedWithErrors)
                    .OrderByDescending(r => r.CompletedAt ?? r.StartedAt)
                    .Select(r => (DateTime?)(r.CompletedAt ?? r.StartedAt))
                    .FirstOrDefaultAsync(cancellationToken);
            }

            return new GetPsdbmItemsResponse
            {
                Items = items,
                TotalItems = totalCount,
                Category = request.Category,
                SearchTerm = request.Search,
                Mode = request.Mode ?? "regional",
                Depot = normalizedMode == "main" ? null : request.Depot,
                LastSynchronizedAt = lastSyncTimestamp
            };
        }

        // Cold start fallback: DB empty before initial sync - fetch directly from PhilGEPS
        logger.LogWarning("Local PSDBM database has no items yet. Falling back to live PhilGEPS fetch.");

        var liveItems = await philGepsService.GetItemsAsync(
            request.Mode ?? "regional",
            request.Search,
            request.Category,
            request.Max,
            request.Depot,
            cancellationToken);

        return new GetPsdbmItemsResponse
        {
            Items = liveItems,
            TotalItems = liveItems.Count,
            Category = request.Category,
            SearchTerm = request.Search,
            Mode = request.Mode ?? "regional",
            Depot = normalizedMode == "main" ? null : request.Depot,
            LastSynchronizedAt = null
        };
    }

    public async Task<PsdbmProductDetailDto?> GetItemDetailAsync(
        Guid? id,
        string? itemCode,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext.PsdbmProducts!
            .Include(p => p.DepotProducts)
            .ThenInclude(dp => dp.Depot)
            .AsNoTracking();

        var product = id.HasValue
            ? await query.FirstOrDefaultAsync(p => p.Id == id.Value, cancellationToken)
            : await query.FirstOrDefaultAsync(p => p.ItemCode == itemCode, cancellationToken);

        if (product == null) return null;

        var depotStocks = product.DepotProducts.Select(dp => new PsdbmDepotStockDto
        {
            DepotId = dp.DepotId,
            DepotName = dp.Depot?.Name ?? "Unknown",
            Region = dp.Depot?.Region,
            Mode = dp.Depot?.Mode,
            Price = dp.Price,
            Availability = dp.Availability,
            AvailableStock = dp.AvailableStock,
            RemainingQtyForDelivery = dp.RemainingQtyForDelivery,
            LastSyncedAt = dp.LastSyncedAt
        }).ToList();

        return new PsdbmProductDetailDto
        {
            Id = product.Id,
            ItemCode = product.ItemCode,
            Description = product.Description,
            Category = product.Category,
            Unit = product.Unit,
            ImageUrl = product.ImageUrl,
            TechnicalSpecificationUrl = product.TechnicalSpecificationUrl,
            IsActive = product.IsActive,
            DepotStocks = depotStocks
        };
    }

    public async Task<List<PsdbmCategoryDto>> GetCategoriesAsync(
        string mode,
        CancellationToken cancellationToken = default)
    {
        var hasDbData = dbContext.PsdbmProducts != null && await dbContext.PsdbmProducts.AnyAsync(cancellationToken);

        if (hasDbData)
        {
            var categoriesWithCount = await dbContext.PsdbmProducts!
                .Where(p => p.IsActive && !string.IsNullOrWhiteSpace(p.Category))
                .GroupBy(p => p.Category)
                .Select(g => new PsdbmCategoryDto
                {
                    Id = g.Key,
                    Name = g.Key,
                    ItemCount = g.Count()
                })
                .OrderBy(c => c.Name)
                .ToListAsync(cancellationToken);

            if (categoriesWithCount.Count > 0)
            {
                return categoriesWithCount;
            }
        }

        // Fallback
        return await philGepsService.GetCategoriesAsync(mode, cancellationToken);
    }

    public async Task<List<PsdbmDepotDto>> GetDepotsAsync(
        CancellationToken cancellationToken = default)
    {
        var hasDbData = dbContext.PsdbmDepots != null && await dbContext.PsdbmDepots.AnyAsync(cancellationToken);

        if (hasDbData)
        {
            var depots = await dbContext.PsdbmDepots!
                .Where(d => d.IsActive)
                .OrderBy(d => d.Mode)
                .ThenBy(d => d.Name)
                .Select(d => new PsdbmDepotDto
                {
                    Id = d.Id.ToString(),
                    Name = d.Name,
                    Region = d.Region ?? d.Mode.ToUpperInvariant()
                })
                .ToListAsync(cancellationToken);

            if (depots.Count > 0)
            {
                return depots;
            }
        }

        // Fallback
        return await philGepsService.GetDepotsAsync(cancellationToken);
    }
}

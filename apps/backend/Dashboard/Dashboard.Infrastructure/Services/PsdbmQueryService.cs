using ERPEZ.Application.Features.Planning.Psdbm.Dtos;
using ERPEZ.Application.Features.Planning.Psdbm.Queries.GetItems;
using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Entities.Procurement;
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

        var pageNumber = Math.Max(1, request.PageNumber);
        var pageSize = request.PageSize > 0 ? request.PageSize : (request.Max > 0 ? request.Max : 25);

        if (hasDbData)
        {
            logger.LogInformation("Querying PSDBM catalogue from local database (Mode: {Mode}, Depot: {Depot}, Page: {Page}, PageSize: {PageSize}, Search: {Search}, Category: {Category}, Stock: {StockFilter})",
                request.Mode, request.Depot, pageNumber, pageSize, request.Search, request.Category, request.StockFilter);

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

                    // Category filter
                    if (!string.IsNullOrWhiteSpace(request.Category) && !request.Category.Equals("All", StringComparison.OrdinalIgnoreCase))
                    {
                        query = query.Where(dp => dp.Product!.Category == request.Category);
                    }

                    // Combined Search (ItemCode and Description)
                    if (!string.IsNullOrWhiteSpace(request.Search))
                    {
                        var term = request.Search.Trim().ToLower();
                        query = query.Where(dp => dp.Product!.Description.ToLower().Contains(term) ||
                                                  dp.Product!.ItemCode.ToLower().Contains(term));
                    }

                    // Availability status filter
                    if (!string.IsNullOrWhiteSpace(request.Availability) && !request.Availability.Equals("All", StringComparison.OrdinalIgnoreCase))
                    {
                        var avail = request.Availability.Trim().ToLower();
                        query = query.Where(dp => dp.Availability.ToLower() == avail);
                    }

                    // Smart Stock Filter
                    if (!string.IsNullOrWhiteSpace(request.StockFilter) && !request.StockFilter.Equals("All", StringComparison.OrdinalIgnoreCase))
                    {
                        var stockMode = request.StockFilter.Trim().ToLower();
                        query = stockMode switch
                        {
                            "in_stock" or "instock" => query.Where(dp => dp.AvailableStock > 0),
                            "out_of_stock" or "outofstock" => query.Where(dp => dp.AvailableStock == 0 || dp.Availability.ToLower() == "out of stock"),
                            "low_stock" or "lowstock" => query.Where(dp => dp.AvailableStock > 0 && dp.AvailableStock <= 50),
                            "has_delivery" or "delivery" => query.Where(dp => dp.RemainingQtyForDelivery > 0),
                            _ => query
                        };
                    }

                    totalCount = await query.CountAsync(cancellationToken);

                    // Sorting
                    query = ApplyDepotProductSorting(query, request.SortBy, request.SortDescending);

                    // Pagination
                    var depotProducts = await query
                        .Skip((pageNumber - 1) * pageSize)
                        .Take(pageSize)
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

                // Sorting
                query = ApplyProductSorting(query, request.SortBy, request.SortDescending);

                // Pagination
                var products = await query
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
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
                PageNumber = pageNumber,
                PageSize = pageSize,
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
            request.Max > 0 ? request.Max : pageSize,
            request.Depot,
            cancellationToken);

        // Apply in-memory paging for fallback if list is large
        var pagedLiveItems = liveItems
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        return new GetPsdbmItemsResponse
        {
            Items = pagedLiveItems.Count > 0 ? pagedLiveItems : liveItems,
            TotalItems = liveItems.Count,
            PageNumber = pageNumber,
            PageSize = pageSize,
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
        if (dbContext.PsdbmProducts == null) return null;

        var query = dbContext.PsdbmProducts
            .Include(p => p.DepotProducts)
                .ThenInclude(dp => dp.Depot)
            .AsQueryable();

        PsdbmProduct? product = null;

        if (id.HasValue && id.Value != Guid.Empty)
        {
            product = await query.FirstOrDefaultAsync(p => p.Id == id.Value, cancellationToken);
        }
        else if (!string.IsNullOrWhiteSpace(itemCode))
        {
            var code = itemCode.Trim().ToLowerInvariant();
            product = await query.FirstOrDefaultAsync(p => p.ItemCode.ToLower() == code, cancellationToken);
        }

        if (product == null) return null;

        return new PsdbmProductDetailDto
        {
            Id = product.Id,
            ItemCode = product.ItemCode,
            Description = product.Description,
            Category = product.Category ?? "General",
            Unit = product.Unit,
            ImageUrl = product.ImageUrl,
            TechnicalSpecificationUrl = product.TechnicalSpecificationUrl,
            IsActive = product.IsActive,
            DepotStocks = product.DepotProducts.Select(dp => new PsdbmDepotStockDto
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
            }).ToList()
        };
    }

    public async Task<List<PsdbmCategoryDto>> GetCategoriesAsync(
        string mode,
        CancellationToken cancellationToken = default)
    {
        if (dbContext.PsdbmProducts != null && await dbContext.PsdbmProducts.AnyAsync(cancellationToken))
        {
            var dbCategories = await dbContext.PsdbmProducts
                .Where(p => p.IsActive && !string.IsNullOrWhiteSpace(p.Category))
                .GroupBy(p => p.Category!)
                .Select(g => new PsdbmCategoryDto
                {
                    Id = g.Key,
                    Name = g.Key,
                    ItemCount = g.Count()
                })
                .OrderBy(c => c.Name)
                .ToListAsync(cancellationToken);

            if (dbCategories.Count > 0) return dbCategories;
        }

        return await philGepsService.GetCategoriesAsync(mode, cancellationToken);
    }

    public async Task<List<PsdbmDepotDto>> GetDepotsAsync(
        string? mode = null,
        CancellationToken cancellationToken = default)
    {
        var normalizedMode = !string.IsNullOrWhiteSpace(mode) ? mode.Trim().ToLowerInvariant() : null;

        if (dbContext.PsdbmDepots != null && await dbContext.PsdbmDepots.AnyAsync(cancellationToken))
        {
            var query = dbContext.PsdbmDepots.Where(d => d.IsActive);

            if (!string.IsNullOrWhiteSpace(normalizedMode))
            {
                query = query.Where(d => d.Mode.ToLower() == normalizedMode);
            }

            var dbDepots = await query
                .OrderBy(d => d.Name)
                .Select(d => new PsdbmDepotDto
                {
                    Id = d.Id.ToString(),
                    Name = d.Name,
                    Region = d.Region ?? string.Empty,
                    Mode = d.Mode
                })
                .ToListAsync(cancellationToken);

            if (dbDepots.Count > 0) return dbDepots;
        }

        if (normalizedMode == "regional")
        {
            return await philGepsService.GetRegionalDepotsAsync(cancellationToken);
        }

        if (normalizedMode == "lgu")
        {
            return await philGepsService.GetLguDepotsAsync(cancellationToken);
        }

        return await philGepsService.GetDepotsAsync(cancellationToken);
    }

    private static IQueryable<PsdbmDepotProduct> ApplyDepotProductSorting(
        IQueryable<PsdbmDepotProduct> query,
        string? sortBy,
        bool sortDescending)
    {
        var sort = (sortBy ?? "description").ToLowerInvariant();
        return sort switch
        {
            "stock" or "availablestock" => sortDescending
                ? query.OrderByDescending(dp => dp.AvailableStock).ThenBy(dp => dp.Product!.Description)
                : query.OrderBy(dp => dp.AvailableStock).ThenBy(dp => dp.Product!.Description),
            "delivery" or "remainingqtyfordelivery" => sortDescending
                ? query.OrderByDescending(dp => dp.RemainingQtyForDelivery).ThenBy(dp => dp.Product!.Description)
                : query.OrderBy(dp => dp.RemainingQtyForDelivery).ThenBy(dp => dp.Product!.Description),
            "price" or "unitprice" => sortDescending
                ? query.OrderByDescending(dp => dp.Price).ThenBy(dp => dp.Product!.Description)
                : query.OrderBy(dp => dp.Price).ThenBy(dp => dp.Product!.Description),
            "itemcode" or "code" => sortDescending
                ? query.OrderByDescending(dp => dp.Product!.ItemCode)
                : query.OrderBy(dp => dp.Product!.ItemCode),
            _ => sortDescending
                ? query.OrderByDescending(dp => dp.Product!.Description)
                : query.OrderBy(dp => dp.Product!.Description)
        };
    }

    private static IQueryable<PsdbmProduct> ApplyProductSorting(
        IQueryable<PsdbmProduct> query,
        string? sortBy,
        bool sortDescending)
    {
        var sort = (sortBy ?? "description").ToLowerInvariant();
        return sort switch
        {
            "itemcode" or "code" => sortDescending
                ? query.OrderByDescending(p => p.ItemCode)
                : query.OrderBy(p => p.ItemCode),
            _ => sortDescending
                ? query.OrderByDescending(p => p.Description)
                : query.OrderBy(p => p.Description)
        };
    }
}

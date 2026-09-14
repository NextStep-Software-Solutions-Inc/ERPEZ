using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Models;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class PurchaseOrderRepository : Repository<PurchaseOrder>, IPurchaseOrderRepository
{
    private readonly ApplicationDbContext context;
    private readonly ISieveProcessor sieveProcessor;

    public PurchaseOrderRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        this.context = context;
        this.sieveProcessor = sieveProcessor;
    }

    public async Task<PurchaseOrder?> GetByIdWithItemsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.Set<PurchaseOrder>()
            .Include(po => po.PurchaseOrderItems)
            .Include(po => po.Supplier)
            .FirstOrDefaultAsync(po => po.Id == id && !po.IsDeleted, cancellationToken);
    }

    public async Task<PurchaseOrder?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.Set<PurchaseOrder>()
            .Include(po => po.PurchaseOrderItems)
            .Include(po => po.Supplier)
            .FirstOrDefaultAsync(po => po.Id == id && !po.IsDeleted, cancellationToken);
    }

    public async Task<(IReadOnlyList<PurchaseOrder> Entities, int TotalCount)> GetPagedPurchaseOrdersAsync(
        SieveModel sieveModel,
        string? search,
        CancellationToken cancellationToken = default)
    {
        var dbQuery = context.Set<PurchaseOrder>()
            .Include(p => p.Supplier)
            .Where(p => !p.IsDeleted)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            dbQuery = dbQuery.Where(p =>
                p.PONumber.ToLower().Contains(term) ||
                (p.Description != null && p.Description.ToLower().Contains(term)) ||
                (p.Supplier != null && p.Supplier.Name.ToLower().Contains(term))
            );
        }

        var filteredQuery = sieveProcessor.Apply(sieveModel, dbQuery, applyPagination: false);
        var totalCount = await filteredQuery.CountAsync(cancellationToken);

        var paginatedQuery = sieveProcessor.Apply(sieveModel, filteredQuery, applyFiltering: false, applySorting: false);
        var entities = await paginatedQuery.ToListAsync(cancellationToken);

        return (entities, totalCount);
    }

    public async Task<List<string>> GetAllPoNumbersAsync(CancellationToken cancellationToken = default)
    {
        return await context.Set<PurchaseOrder>()
            .Where(p => !p.IsDeleted)
            .Select(p => p.PONumber)
            .ToListAsync(cancellationToken);
    }
}

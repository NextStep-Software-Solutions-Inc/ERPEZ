using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Models;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class RFQRepository : Repository<RFQ>, IRFQRepository
{
    private readonly ApplicationDbContext context;
    private readonly ISieveProcessor sieveProcessor;

    public RFQRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        this.context = context;
        this.sieveProcessor = sieveProcessor;
    }

    private IQueryable<RFQ> BuildDetailedQuery(IQueryable<RFQ>? query = null)
    {
        var baseQuery = query ?? context.Set<RFQ>();

        return baseQuery
            .Include(r => r.ModeOfProcurement)
            .Include(r => r.RFQItems
                .Where(item => !item.IsDeleted))
                .ThenInclude(item => item.CPRItem)
                    .ThenInclude(ci => ci.PRItem)
            .Include(r => r.RFQSuppliers
                .Where(s => !s.IsDeleted))
                .ThenInclude(s => s.Supplier)
            .AsSplitQuery();
    }

    public async Task<(IReadOnlyList<RFQ> Entities, int TotalCount)> GetAllWithDetailsAsync(
        SieveModel sieveModel,
        CancellationToken cancellationToken = default)
    {
        var query = BuildDetailedQuery(context.Set<RFQ>()
            .AsNoTracking()
            .Where(r => !r.IsDeleted));

        var filteredQuery = sieveProcessor.Apply(sieveModel, query, applyPagination: false);
        var totalCount = await filteredQuery.CountAsync(cancellationToken);
        var entities = await sieveProcessor.Apply(sieveModel, filteredQuery).ToListAsync(cancellationToken);

        return (entities, totalCount);
    }

    public async Task<RFQ?> GetRFQWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await BuildDetailedQuery()
            .FirstOrDefaultAsync(r => r.Id == id && !r.IsDeleted, cancellationToken);
    }

    public async Task<bool> HasRFQNumberAsync(string rfqNumber, CancellationToken cancellationToken = default)
    {
        return await context.Set<RFQ>()
            .AnyAsync(r => r.RFQNumber == rfqNumber && !r.IsDeleted, cancellationToken);
    }

    public async Task<bool> HasTracingNumberAsync(string tracingNumber, CancellationToken cancellationToken = default)
    {
        return await context.Set<RFQ>()
            .AnyAsync(r => r.TracingNumber == tracingNumber && !r.IsDeleted, cancellationToken);
    }

    public async Task<RFQItem?> GetItemByIdAsync(Guid rfqItemId, CancellationToken cancellationToken = default)
    {
        return await context.Set<RFQItem>()
            .FirstOrDefaultAsync(i => i.Id == rfqItemId && !i.IsDeleted, cancellationToken);
    }

    public async Task<int> GetSourcedQuantityForCprItemAsync(
        Guid cprItemId,
        Guid? excludingRfqId = null,
        CancellationToken cancellationToken = default)
    {
        var query = context.Set<RFQItem>()
            .Include(i => i.RFQ)
            .Where(i => !i.IsDeleted
                        && i.CPRItemId == cprItemId
                        && i.RFQ.Status != StatusEnum.Returned);

        if (excludingRfqId.HasValue)
        {
            query = query.Where(i => i.RFQId != excludingRfqId.Value);
        }

        return await query.SumAsync(i => i.Quantity, cancellationToken);
    }

    public async Task<(int Total, int Draft, int Submitted, int Approved, int Returned)> GetSummaryAsync(
        CancellationToken cancellationToken = default)
    {
        var baseQuery = context.Set<RFQ>().Where(r => !r.IsDeleted);

        var total = await baseQuery.CountAsync(cancellationToken);
        var draft = await baseQuery.CountAsync(r => r.Status == StatusEnum.Draft, cancellationToken);
        var submitted = await baseQuery.CountAsync(r => r.Status == StatusEnum.Submitted, cancellationToken);
        var approved = await baseQuery.CountAsync(r => r.Status == StatusEnum.Approved, cancellationToken);
        var returned = await baseQuery.CountAsync(r => r.Status == StatusEnum.Returned, cancellationToken);

        return (total, draft, submitted, approved, returned);
    }

    public async Task<RFQ?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.Set<RFQ>()
            .FirstOrDefaultAsync(r => r.Id == id && !r.IsDeleted, cancellationToken);
    }

    public void RemoveItem(RFQItem item)
    {
        context.Set<RFQItem>().Remove(item);
    }
}

using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Sieve.Models;
using Sieve.Services;
using System.Linq.Expressions;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class ConsolidatedPRRepository : Repository<ConsolidatedPR>, IConsolidatedPRRepository
{
    private readonly ApplicationDbContext context;
    private readonly ISieveProcessor      sieveProcessor;

    public ConsolidatedPRRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        this.context        = context;
        this.sieveProcessor = sieveProcessor;
    }

    private IQueryable<ConsolidatedPR> BuildDetailedQuery(IQueryable<ConsolidatedPR>? source = null)
    {
        var q = source ?? context.Set<ConsolidatedPR>();

        return q
            .Include(cpr => cpr.ConsolidatedPRItems)
                .ThenInclude(ci => ci.PurchaseRequest)
                    .ThenInclude(pr => pr.Office)
            .Include(cpr => cpr.ConsolidatedPRItems)
                .ThenInclude(ci => ci.PurchaseRequest)
                    .ThenInclude(pr => pr.ProcurementCategory)
            .Include(cpr => cpr.ConsolidatedPRItems)
                .ThenInclude(ci => ci.PurchaseRequest)
                    .ThenInclude(pr => pr.FundSource)
            .Include(cpr => cpr.ConsolidatedPRItems)
                .ThenInclude(ci => ci.PRItem)
                    .ThenInclude(i => i.PPMPItem)
                        .ThenInclude(pi => pi!.ProcurementMode)
                            .ThenInclude(pm => pm!.ProcurementCategory)
            .Include(cpr => cpr.ConsolidatedPRItems)
                .ThenInclude(ci => ci.PRItem)
                    .ThenInclude(i => i.PPMPItem)
                        .ThenInclude(pi => pi!.CSEItem)
                            .ThenInclude(c => c!.ItemCategory)
            .Include(cpr => cpr.ConsolidatedPRItems)
                .ThenInclude(ci => ci.PRItem)
                    .ThenInclude(i => i.PPMPItem)
                        .ThenInclude(pi => pi!.NonCSEItem)
                            .ThenInclude(n => n!.ItemCategory)
            .Include(cpr => cpr.ConsolidatedPRItems)
                .ThenInclude(ci => ci.PRItem)
                    .ThenInclude(i => i.PPMPItem)
                        .ThenInclude(pi => pi!.APPItems)
                            .ThenInclude(ai => ai.APP)
            .Include(cpr => cpr.ConsolidatedPRItems)
                .ThenInclude(ci => ci.PRItem)
                    .ThenInclude(i => i.PPMPItem)
                        .ThenInclude(pi => pi!.APPItems)
                            .ThenInclude(ai => ai.ProcurementMode)
            .Include(cpr => cpr.ConsolidatedPRItems)
                .ThenInclude(ci => ci.ProcurementMode)
            .AsSplitQuery();
    }

    public async Task<ConsolidatedPR?> GetCPRWithDetailsAsync(
        Guid id, CancellationToken cancellationToken = default)
    {
        return await BuildDetailedQuery()
            .Where(cpr => cpr.Id == id && !cpr.IsDeleted)
            .FirstOrDefaultAsync(cancellationToken);
    }

    /// <summary>
    /// Approved CPRs only, with full item details — feeds the "Add Consolidated PR" modal
    /// on the RFQ create/edit screen (only Approved CPRs are eligible to source RFQ items).
    /// </summary>
    public async Task<IReadOnlyList<ConsolidatedPR>> GetAllApprovedWithDetailsAsync(
        CancellationToken cancellationToken = default)
    {
        return await BuildDetailedQuery(
                context.Set<ConsolidatedPR>().AsNoTracking().Where(cpr => !cpr.IsDeleted))
            .Where(cpr => cpr.Status == StatusEnum.Approved)
            .ToListAsync(cancellationToken);
    }

    public async Task<(IReadOnlyList<ConsolidatedPR> Entities, int TotalCount)> GetDetailedPagedAsync(
        SieveModel sieveModel, CancellationToken cancellationToken = default)
    {
        var query         = BuildDetailedQuery(
                                context.Set<ConsolidatedPR>().AsNoTracking().Where(cpr => !cpr.IsDeleted));
        var filteredQuery = sieveProcessor.Apply(sieveModel, query, applyPagination: false);
        var totalCount    = await filteredQuery.CountAsync(cancellationToken);
        var pagedQuery    = sieveProcessor.Apply(sieveModel, filteredQuery,
                                applyFiltering: false, applySorting: false);
        var entities      = await pagedQuery.ToListAsync(cancellationToken);
        return (entities, totalCount);
    }

    public async Task<(IReadOnlyList<TDto> Entities, int TotalCount)> GetCPRsWithDetailsAsync<TDto>(
        SieveModel sieveModel,
        Expression<Func<ConsolidatedPR, TDto>> projection,
        List<Expression<Func<ConsolidatedPR, object>>> includes,
        CancellationToken cancellationToken = default) where TDto : class
    {
        IQueryable<ConsolidatedPR> query = context.Set<ConsolidatedPR>().AsNoTracking().Where(e => !e.IsDeleted);

        foreach (var include in includes)
            query = query.Include(include);

        var filteredQuery  = sieveProcessor.Apply(sieveModel, query, applyPagination: false);
        var totalCount     = await filteredQuery.CountAsync(cancellationToken);
        var paginatedQuery = sieveProcessor.Apply(sieveModel, filteredQuery,
                                applyFiltering: false, applySorting: false);
        var entities       = await paginatedQuery.Select(projection).ToListAsync(cancellationToken);
        return (entities, totalCount);
    }
}
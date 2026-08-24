using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Models;
using Sieve.Services;
using System.Linq.Expressions;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class PPMPRepository : Repository<PPMP>, IPPMPRepository
{
    private readonly ApplicationDbContext context;
    private readonly ISieveProcessor sieveProcessor;

    public PPMPRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        this.context = context;
        this.sieveProcessor = sieveProcessor;
    }

    private IQueryable<PPMP> BuildDetailedQuery(IQueryable<PPMP>? query = null)
    {
        var baseQuery = query ?? context.Set<PPMP>();

        return baseQuery
            .Include(p => p.Office)
            .Include(p => p.FiscalYear)
            .Include(p => p.FundSource)
            .Include(p => p.LineItemBudget)
            .Include(p => p.ParentPPMP)
                .ThenInclude(parent => parent!.Office)
            .Include(p => p.ParentPPMP)
                .ThenInclude(parent => parent!.FiscalYear)
            .Include(p => p.ParentPPMP)
                .ThenInclude(parent => parent!.FundSource)
            .Include(p => p.ParentPPMP)
                .ThenInclude(parent => parent!.LineItemBudget)
            .Include(p => p.PPMPActivities)
                .ThenInclude(pa => pa.LIBActivity)
            .Include(p => p.PPMPActivities)
                .ThenInclude(pa => pa.PPMPExpenditureItems)
                    .ThenInclude(pei => pei.PPMPItems)
                        .ThenInclude(pi => pi.PPMPItemAllocations)
            .Include(p => p.PPMPActivities)
                .ThenInclude(pa => pa.PPMPExpenditureItems)
                    .ThenInclude(pei => pei.PPMPItems)
                        .ThenInclude(pi => pi.ProcurementMode)
            .Include(p => p.PPMPActivities)
                .ThenInclude(pa => pa.PPMPExpenditureItems)
                    .ThenInclude(pei => pei.PPMPItems)
                        .ThenInclude(pi => pi.NonCSEItem)
                            .ThenInclude(n => n!.UOM)
            .Include(p => p.PPMPActivities)
                .ThenInclude(pa => pa.PPMPExpenditureItems)
                    .ThenInclude(pei => pei.PPMPItems)
                        .ThenInclude(pi => pi.CSEItem)
            .Include(p => p.ApprovalEvents.OrderByDescending(ae => ae.Timestamp))
            .Include(p => p.ChildPPMPs)
                .ThenInclude(child => child.Office)
            .Include(p => p.ChildPPMPs)
                .ThenInclude(child => child.FiscalYear)
            .Include(p => p.ChildPPMPs)
                .ThenInclude(child => child.FundSource)
            .Include(p => p.ChildPPMPs)
                .ThenInclude(child => child.LineItemBudget)
            .AsSplitQuery();
    }

    public async Task<PPMP?> GetPPMPWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
    // Reuse the existing BuildDetailedQuery instead of duplicating includes
        return await BuildDetailedQuery()
            .Where(p => p.Id == id && !p.IsDeleted)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<(IReadOnlyList<PPMP> Entities, int TotalCount)> GetDetailedPagedAsync(SieveModel sieveModel, string? search = null, CancellationToken cancellationToken = default)
    {
        var query = BuildDetailedQuery(context.Set<PPMP>().AsNoTracking().Where(p => !p.IsDeleted));

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.ToLower();
            query = query.Where(p => 
                p.PPMPNumber.ToLower().Contains(searchLower) ||
                (p.Description != null && p.Description.ToLower().Contains(searchLower)) ||
                p.Office.Name.ToLower().Contains(searchLower) ||
                p.FiscalYear.Year.ToString().Contains(searchLower) ||
                (p.LineItemBudget != null && p.LineItemBudget.Name != null && p.LineItemBudget.Name.ToLower().Contains(searchLower)) ||
                (p.LineItemBudget != null && p.LineItemBudget.LIBNumber.ToLower().Contains(searchLower))
            );
        }

        if (string.IsNullOrWhiteSpace(sieveModel.Sorts))
        {
            query = query.OrderByDescending(p => p.CreatedAt);
        }

        var filteredQuery = sieveProcessor.Apply(sieveModel, query, applyPagination: false);
        var totalCount = await filteredQuery.CountAsync(cancellationToken);
        var pagedQuery = sieveProcessor.Apply(sieveModel, filteredQuery, applyFiltering: false, applySorting: false);
        var entities = await pagedQuery.ToListAsync(cancellationToken);
        return (entities, totalCount);
    }

    public async Task<List<PPMP>> GetDetailedByOfficeAsync(Guid officeId, CancellationToken cancellationToken = default)
    {
        return await BuildDetailedQuery(context.Set<PPMP>().Where(p => !p.IsDeleted && p.OfficeId == officeId))
            .ToListAsync(cancellationToken);
    }

    public async Task<List<PPMP>> GetDetailedByFiscalYearAsync(Guid fiscalYearId, CancellationToken cancellationToken = default)
    {
        return await BuildDetailedQuery(context.Set<PPMP>().Where(p => !p.IsDeleted && p.FiscalYearId == fiscalYearId))
            .ToListAsync(cancellationToken);
    }

    public async Task<(IReadOnlyList<TDto> Entities, int TotalCount)> GetPPMPsWithDetailsAsync<TDto>(
        SieveModel sieveModel,
        Expression<Func<PPMP, TDto>> projection,
        List<Expression<Func<PPMP, object>>> includes,
        CancellationToken cancellationToken = default) where TDto : class
    {
        IQueryable<PPMP> query = context.Set<PPMP>().AsNoTracking().Where(e => !e.IsDeleted);

        foreach (var include in includes)
        {
            query = query.Include(include);
        }

        var filteredQuery = sieveProcessor.Apply(sieveModel, query, applyPagination: false);

        var totalCount = await filteredQuery.CountAsync(cancellationToken);

        var paginatedResult = sieveProcessor.Apply(sieveModel, filteredQuery, applyFiltering: false, applySorting: false);

        var entities = await paginatedResult.Select(projection).ToListAsync(cancellationToken);

        return (entities, totalCount);
    }
}

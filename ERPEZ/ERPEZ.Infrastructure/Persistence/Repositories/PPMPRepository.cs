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

    public async Task<PPMP?> GetPPMPWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.Set<PPMP>()
            .Include(p => p.Office)
            .Include(p => p.FiscalYear)
            .Include(p => p.FundSource)
            .Include(p => p.LineItemBudget)
            .Include(p => p.PPMPItems)
                .ThenInclude(pi => pi.PPMPItemAllocations)
            .Include(p => p.PPMPActivities)
                .ThenInclude(pa => pa.LIBActivity)
            .Include(p => p.ApprovalEvents.OrderByDescending(ae => ae.Timestamp))
            .AsSplitQuery()
            .FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted, cancellationToken);
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

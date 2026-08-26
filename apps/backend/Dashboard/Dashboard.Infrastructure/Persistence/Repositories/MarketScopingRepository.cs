using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Models;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class MarketScopingRepository : Repository<MarketScoping>, IMarketScopingRepository
{
    private readonly ApplicationDbContext dbContext;
    private readonly ISieveProcessor sieveProcessor;

    public MarketScopingRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        dbContext = context;
        this.sieveProcessor = sieveProcessor;
    }

    public async Task<MarketScoping?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await dbContext.MarketScopings!
            .Include(x => x.User)
                .ThenInclude(u => u.Office)
            .Include(x => x.TargetLineItemBudget)
            .Include(x => x.TargetLineItemBudgetActivity)
            .Include(x => x.ActivitiesConducted)
                .ThenInclude(a => a.ActivitySettings)
            .Include(x => x.ActivitiesConducted)
                .ThenInclude(a => a.Attachments)
            .Include(x => x.ParameterEvaluations)
                .ThenInclude(p => p.ParameterSettings)
            .Include(x => x.ParameterEvaluations)
                .ThenInclude(p => p.Attachments)
            .Include(x => x.StatusHistory)
            .AsSplitQuery()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<(IEnumerable<MarketScoping>, int)> GetAllWithDetailsAsync(SieveModel sieveModel, CancellationToken cancellationToken = default)
    {
        var query = dbContext.MarketScopings!
            .Include(x => x.User)
            .Include(x => x.TargetLineItemBudget)
            .Include(x => x.TargetLineItemBudgetActivity)
            .Include(x => x.ActivitiesConducted)
                .ThenInclude(a => a.Attachments)
            .Include(x => x.ParameterEvaluations)
                .ThenInclude(p => p.Attachments)
            .Include(x => x.StatusHistory)
            .Where(x => !x.IsDeleted)
            .AsSplitQuery()
            .AsNoTracking();

        var filteredQuery = sieveProcessor.Apply(sieveModel, query, applyPagination: false);
        var totalCount = await filteredQuery.CountAsync(cancellationToken);
        var result = await sieveProcessor.Apply(sieveModel, filteredQuery).ToListAsync(cancellationToken);

        return ((IEnumerable<MarketScoping>)result, totalCount);
    }

    public async Task<List<MarketScoping>> GetAllWithDetailsAsync(bool includeDeleted = false, CancellationToken cancellationToken = default)
    {
        var query = dbContext.MarketScopings!
            .Include(x => x.User)
            .Include(x => x.TargetLineItemBudget)
            .Include(x => x.TargetLineItemBudgetActivity)
            .Include(x => x.ActivitiesConducted)
                .ThenInclude(a => a.Attachments)
            .Include(x => x.ParameterEvaluations)
                .ThenInclude(p => p.Attachments)
            .Include(x => x.StatusHistory)
            .AsSplitQuery()
            .AsNoTracking();

        if (!includeDeleted)
        {
            query = query.Where(x => !x.IsDeleted);
        }

        return await query.ToListAsync(cancellationToken);
    }

    public async Task<MarketScoping?> GetByTargetLineItemBudgetIdAsync(Guid libId, CancellationToken cancellationToken = default)
    {
        return await dbContext.MarketScopings!
            .AsNoTracking()
            .FirstOrDefaultAsync(
                ms => ms.TargetLineItemBudgetId == libId && !ms.IsDeleted,
                cancellationToken);
    }

    public async Task<Dictionary<Guid, MarketScoping>> GetByTargetLineItemBudgetActivityIdsAsync(
        IEnumerable<Guid> libActivityIds,
        CancellationToken cancellationToken = default)
    {
        var idList = libActivityIds.Distinct().ToList();
        if (idList.Count == 0) return [];

        var results = await dbContext.MarketScopings!
            .AsNoTracking()
            .Where(ms => ms.TargetLineItemBudgetActivityId.HasValue
                         && idList.Contains(ms.TargetLineItemBudgetActivityId.Value)
                         && !ms.IsDeleted)
            .ToListAsync(cancellationToken);

        return results
            .GroupBy(ms => ms.TargetLineItemBudgetActivityId!.Value)
            .ToDictionary(g => g.Key, g => g.First());
    }
}

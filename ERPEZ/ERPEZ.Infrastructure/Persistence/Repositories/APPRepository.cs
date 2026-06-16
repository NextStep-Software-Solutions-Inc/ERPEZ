using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Models;
using Sieve.Services;
using System.Linq.Expressions;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class APPRepository : Repository<APP>, IAPPRepository
{
    private readonly ApplicationDbContext context;
    private readonly ISieveProcessor sieveProcessor;

    public APPRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        this.context = context;
        this.sieveProcessor = sieveProcessor;
    }

    private IQueryable<APP> BuildDetailedQuery(IQueryable<APP>? query = null)
    {
        var baseQuery = query ?? context.Set<APP>();

        return baseQuery
            .Include(a => a.FiscalYear)
            .Include(a => a.Office)
            .Include(a => a.APPItems
                .Where(item => !item.IsDeleted))
                .ThenInclude(item => item.PPMPItem)
                    .ThenInclude(ppmpItem => ppmpItem.PPMPItemAllocations)
            .Include(a => a.APPItems
                .Where(item => !item.IsDeleted))
                .ThenInclude(item => item.ProcurementMode)
            .Include(a => a.APPItems
                .Where(item => !item.IsDeleted))
                .ThenInclude(item => item.FundSource)
            .Include(a => a.APPItems
                .Where(item => !item.IsDeleted))
                .ThenInclude(item => item.Office)
            .Include(a => a.APPItems
                .Where(item => !item.IsDeleted))
                .ThenInclude(item => item.PPMPItem)
                    .ThenInclude(ppmpItem => ppmpItem.APPProcurementSchedules)
                        .ThenInclude(schedule => schedule.ProcurementActivityType)
            .Include(a => a.APPPPMPs)
                .ThenInclude(s => s.PPMP)
                    .ThenInclude(ppmp => ppmp!.Office)
            .Include(a => a.APPPPMPs)
                .ThenInclude(s => s.PPMP)
                    .ThenInclude(ppmp => ppmp!.FiscalYear)
            .Include(a => a.APPPPMPs)
                .ThenInclude(s => s.PPMP)
                    .ThenInclude(ppmp => ppmp!.FundSource)
            .AsSplitQuery();
    }

    public async Task<(IReadOnlyList<APP> Entities, int TotalCount)> GetAllWithDetailsAsync(
        SieveModel sieveModel,
        CancellationToken cancellationToken = default)
    {
        var query = BuildDetailedQuery(context.Set<APP>()
            .AsNoTracking()
            .Where(a => !a.IsDeleted));

        var filteredQuery = sieveProcessor.Apply(sieveModel, query, applyPagination: false);
        var totalCount = await filteredQuery.CountAsync(cancellationToken);
        var entities = await sieveProcessor.Apply(sieveModel, filteredQuery).ToListAsync(cancellationToken);

        return (entities, totalCount);
    }

    public async Task<APP?> GetAPPWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await BuildDetailedQuery()
            .FirstOrDefaultAsync(a => a.Id == id && !a.IsDeleted, cancellationToken);
    }

    public async Task<(IReadOnlyList<TDto> Entities, int TotalCount)> GetAPPsByOfficeAsync<TDto>(
        Guid officeId,
        SieveModel sieveModel,
        Expression<Func<APP, TDto>> projection,
        CancellationToken cancellationToken = default) where TDto : class
    {
        var query = BuildDetailedQuery(context.Set<APP>()
            .AsNoTracking()
            .Where(a => a.OfficeId == officeId && !a.IsDeleted));

        var filteredQuery = sieveProcessor.Apply(sieveModel, query, applyPagination: false);
        var totalCount = await filteredQuery.CountAsync(cancellationToken);
        
        var entities = await sieveProcessor
            .Apply(sieveModel, filteredQuery)
            .Select(projection)
            .ToListAsync(cancellationToken);

        return (entities, totalCount);
    }

    public async Task<(IReadOnlyList<TDto> Entities, int TotalCount)> GetAPPsByFiscalYearAsync<TDto>(
        Guid fiscalYearId,
        SieveModel sieveModel,
        Expression<Func<APP, TDto>> projection,
        CancellationToken cancellationToken = default) where TDto : class
    {
        var query = BuildDetailedQuery(context.Set<APP>()
            .AsNoTracking()
            .Where(a => a.FiscalYearId == fiscalYearId && !a.IsDeleted));

        var filteredQuery = sieveProcessor.Apply(sieveModel, query, applyPagination: false);
        var totalCount = await filteredQuery.CountAsync(cancellationToken);
        
        var entities = await sieveProcessor
            .Apply(sieveModel, filteredQuery)
            .Select(projection)
            .ToListAsync(cancellationToken);

        return (entities, totalCount);
    }

    public async Task<bool> HasAPPNumberAsync(string appNumber, CancellationToken cancellationToken = default)
    {
        return await context.Set<APP>()
            .AnyAsync(a => a.APPNumber == appNumber && !a.IsDeleted, cancellationToken);
    }

    public async Task<bool> HasAPPNumberAsync(string appNumber, Guid excludeId, CancellationToken cancellationToken = default)
    {
        return await context.Set<APP>()
            .AnyAsync(a => a.APPNumber == appNumber && a.Id != excludeId && !a.IsDeleted, cancellationToken);
    }
}

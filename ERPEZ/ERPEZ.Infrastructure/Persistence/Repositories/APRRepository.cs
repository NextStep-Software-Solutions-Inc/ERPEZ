using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Models;
using Sieve.Services;
using System.Linq.Expressions;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class APRRepository : Repository<APR>, IAPRRepository
{
    private readonly ApplicationDbContext context;
    private readonly ISieveProcessor sieveProcessor;

    public APRRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        this.context = context;
        this.sieveProcessor = sieveProcessor;
    }

    private IQueryable<APR> BuildDetailedQuery(IQueryable<APR>? query = null)
    {
        var baseQuery = query ?? context.Set<APR>();

        return baseQuery
            .Include(a => a.APP)
            .Include(a => a.Office)
            .Include(a => a.FiscalYear)
            .Include(a => a.APRItems
                .Where(item => !item.IsDeleted))
                .ThenInclude(item => item.APPItem)
            .Include(a => a.APRItems
                .Where(item => !item.IsDeleted))
                .ThenInclude(item => item.PPMPItem)
            .Include(a => a.APRItems
                .Where(item => !item.IsDeleted))
                .ThenInclude(item => item.APRItemMilestones
                    .Where(m => !m.IsDeleted))
                    .ThenInclude(m => m.ProcurementActivityType)
            .AsSplitQuery();
    }

    public async Task<(IReadOnlyList<APR> Entities, int TotalCount)> GetAllWithDetailsAsync(
        SieveModel sieveModel,
        CancellationToken cancellationToken = default)
    {
        var query = BuildDetailedQuery(context.Set<APR>()
            .AsNoTracking()
            .Where(a => !a.IsDeleted));

        var filteredQuery = sieveProcessor.Apply(sieveModel, query, applyPagination: false);
        var totalCount = await filteredQuery.CountAsync(cancellationToken);
        var entities = await sieveProcessor.Apply(sieveModel, filteredQuery).ToListAsync(cancellationToken);

        return (entities, totalCount);
    }

    public async Task<APR?> GetAPRWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await BuildDetailedQuery()
            .FirstOrDefaultAsync(a => a.Id == id && !a.IsDeleted, cancellationToken);
    }

    public async Task<(IReadOnlyList<TDto> Entities, int TotalCount)> GetAPRsByOfficeAsync<TDto>(
        Guid officeId,
        SieveModel sieveModel,
        Expression<Func<APR, TDto>> projection,
        CancellationToken cancellationToken = default) where TDto : class
    {
        var query = BuildDetailedQuery(context.Set<APR>()
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

    public async Task<(IReadOnlyList<TDto> Entities, int TotalCount)> GetAPRsByFiscalYearAsync<TDto>(
        Guid fiscalYearId,
        SieveModel sieveModel,
        Expression<Func<APR, TDto>> projection,
        CancellationToken cancellationToken = default) where TDto : class
    {
        var query = BuildDetailedQuery(context.Set<APR>()
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

    public async Task<bool> HasAPRNumberAsync(string aprNumber, CancellationToken cancellationToken = default)
    {
        return await context.Set<APR>()
            .AnyAsync(a => a.APRNumber == aprNumber && !a.IsDeleted, cancellationToken);
    }

    public async Task<bool> HasAPRNumberAsync(string aprNumber, Guid excludeId, CancellationToken cancellationToken = default)
    {
        return await context.Set<APR>()
            .AnyAsync(a => a.APRNumber == aprNumber && a.Id != excludeId && !a.IsDeleted, cancellationToken);
    }

    public async Task<int> CountDraftsForOfficeAsync(Guid fiscalYearId, Guid officeId, CancellationToken cancellationToken = default)
    {
        return await context.Set<APR>()
            .Where(a => a.FiscalYearId == fiscalYearId
                && a.OfficeId == officeId
                && a.Status == StatusEnum.Draft
                && !a.IsDeleted)
            .CountAsync(cancellationToken);
    }

    public async Task<int> CountSubmittedForFiscalYearAsync(Guid fiscalYearId, CancellationToken cancellationToken = default)
    {
        return await context.Set<APR>()
            .Where(a => a.FiscalYearId == fiscalYearId
                && a.Status == StatusEnum.Submitted
                && !a.IsDeleted)
            .CountAsync(cancellationToken);
    }
}

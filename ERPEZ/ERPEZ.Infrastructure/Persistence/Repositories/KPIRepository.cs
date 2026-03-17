using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Models;
using Sieve.Services;
using System.Linq.Expressions;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class KPIRepository : Repository<Domain.Entities.Planning.KPI>, IKPIRepository
{
    private readonly ApplicationDbContext context;
    private readonly ISieveProcessor sieveProcessor;

    public KPIRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        this.context = context;
        this.sieveProcessor = sieveProcessor;
    }

    public async Task<Domain.Entities.Planning.KPI?> GetKPIWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.Set<Domain.Entities.Planning.KPI>()
            .Include(k => k.KPIPerformanceMeasures)
                .ThenInclude(kpm => kpm.Ratings)
            .Include(k => k.KPITargets)
            .Include(k => k.KPIModeOfVerifications)
            .Include(k => k.KPIMeasurements)
                .ThenInclude(km => km.RatingScaleTemplate)
            .Include(k => k.MFOPAP)
            .Include(k => k.SDGs)
            .Include(k => k.Attributes)
            .FirstOrDefaultAsync(k => EF.Property<Guid>(k, "Id") == id, cancellationToken);
    }

    public async Task<(IReadOnlyList<TDto> Entities, int TotalCount)> GetKPIsWithDetailsAsync<TDto>(
        SieveModel sieveModel,
        Expression<Func<Domain.Entities.Planning.KPI, TDto>> projection,
        List<Expression<Func<Domain.Entities.Planning.KPI, object>>> includes,
        CancellationToken cancellationToken = default) where TDto : class
    {
        IQueryable<Domain.Entities.Planning.KPI> query = context.Set<Domain.Entities.Planning.KPI>().AsNoTracking();

        foreach (var include in includes)
        {
            query = query.Include(include);
        }

        var filteredQuery = sieveProcessor.Apply(sieveModel, query, applyPagination: false);

        var totalCount = await filteredQuery.CountAsync(cancellationToken);

        var paginatedResult = sieveProcessor.Apply(sieveModel, filteredQuery, applyFiltering: false);

        var entities = await paginatedResult.Select(projection).ToListAsync(cancellationToken);

        return (entities, totalCount);
    }
}

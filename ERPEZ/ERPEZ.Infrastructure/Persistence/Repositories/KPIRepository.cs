using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Models;
using Sieve.Services;
using System.Linq.Expressions;
using static Sieve.Extensions.MethodInfoExtended;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class KPIRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<Domain.Entities.Planning.KPI>(context, sieveProcessor),
      IKPIRepository
{
    private readonly ApplicationDbContext context = context;
    public async Task<Domain.Entities.Planning.KPI?> GetKPIWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.Set<Domain.Entities.Planning.KPI>()
            .Include(k => k.KPIRatings)
            .Include(k => k.KPITargets)
            .Include(k => k.KPIModeOfVerifications)
            .Include(k => k.MFOKPIs)
            .Include(k => k.MFOKPIs).ThenInclude(m=> m.MFOPAP)
            .Include(k => k.SDGs)
            .Include(k => k.Attributes)
            .FirstOrDefaultAsync(k => EF.Property<Guid>(k, "Id") == id, cancellationToken);
    }
    public async Task<(IReadOnlyList<TDto> Entities, int TotalCount)> GetKPIsWithDetailsAsyncGetAllAsync<TDto>(
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

        query = query.Include(k => k.MFOKPIs).ThenInclude(m => m.MFOPAP);


        var filteredQuery = sieveProcessor.Apply(sieveModel, query, applyPagination: false);

        var totalCount = await filteredQuery.CountAsync(cancellationToken);

        var paginatedResult = sieveProcessor.Apply(sieveModel, filteredQuery, applyFiltering: false);

        var entities = await paginatedResult.Select(projection).ToListAsync(cancellationToken);

        return (entities, totalCount);
    }
}

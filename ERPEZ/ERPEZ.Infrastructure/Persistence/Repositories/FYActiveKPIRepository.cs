using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class FYActiveKPIRepository : Repository<Domain.Entities.Planning.FYActiveKPI>, IFYActiveKPIRepository
{
    private readonly ApplicationDbContext context;
    private readonly ISieveProcessor sieveProcessor;

    public FYActiveKPIRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        this.context = context;
        this.sieveProcessor = sieveProcessor;
    }

    public async Task<Domain.Entities.Planning.FYActiveKPI?> GetFYActiveKPIWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await context.Set<Domain.Entities.Planning.FYActiveKPI>()
            .Where(f => !f.IsDeleted)
            .Include(f => f.FYActiveKPIMeasurements)
                .ThenInclude(m => m.RatingScaleTemplate)
                    .ThenInclude(r => r!.RatingScaleLevels)
            .Include(f => f.KPIAssignments)
                .ThenInclude(a => a.Office)
            .Include(f => f.FiscalYear)
            .Include(f => f.MasterKPI)
            .Include(f => f.MFOPAP)
            .FirstOrDefaultAsync(f => f.Id == id, cancellationToken);
    }

    public async Task<(IReadOnlyList<TDto> Entities, int TotalCount)> GetAvailableForOfficeAsync<TDto>(
        Sieve.Models.SieveModel sieveModel,
        Guid officeId,
        System.Linq.Expressions.Expression<Func<Domain.Entities.Planning.FYActiveKPI, TDto>> projection,
        CancellationToken cancellationToken = default)
    {
        var assignedIds = context.Set<Domain.Entities.Planning.KPIAssignment>()
            .Where(a => !a.IsDeleted && a.OfficeId == officeId)
            .Select(a => a.FYActiveKPIId);

        IQueryable<Domain.Entities.Planning.FYActiveKPI> query = context
            .Set<Domain.Entities.Planning.FYActiveKPI>()
            .AsNoTracking()
            .Where(fy => !fy.IsDeleted && fy.IsOptInAvailable && !assignedIds.Contains(fy.Id));

        var filteredQuery = sieveProcessor.Apply(sieveModel, query, applyPagination: false);
        var totalCount = await filteredQuery.CountAsync(cancellationToken);
        var paginatedQuery = sieveProcessor.Apply(sieveModel, filteredQuery, applyFiltering: false, applySorting: false);
        var entities = await paginatedQuery.Select(projection).ToListAsync(cancellationToken);

        return (entities, totalCount);
    }
}

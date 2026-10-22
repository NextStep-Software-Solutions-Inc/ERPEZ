using Sieve.Services;
using Microsoft.EntityFrameworkCore;
using ERPEZ.Domain.Dtos.Planning;

namespace ERPEZ.Infrastructure.Persistence.Repositories;
public class DUKPITargetAssignmentRepository : Repository<Domain.Entities.Planning.DUKPITargetAssignment>, Domain.Interfaces.IDUKPITargetAssignmentRepository
{
    private readonly ApplicationDbContext context;
    private readonly ISieveProcessor sieveProcessor;

    public DUKPITargetAssignmentRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        this.context = context;
        this.sieveProcessor = sieveProcessor;
    }
    public async Task<Dictionary<Guid, decimal>> GetTotalAllocatedByKPITargetIdsAsync(IEnumerable<Guid> kpiTargetIds, CancellationToken cancellationToken = default)
    {
        var aggregatedAllocations = await ToListAsync(
            context.DUKPITargetAssignments!
                .Where(a => kpiTargetIds.Contains(a.KPITargetId))
                .GroupBy(a => a.KPITargetId)
                .Select(g => new { KPITargetId = g.Key, TotalAllocated = g.Sum(a => a.AllocatedTargetValue) }),
            cancellationToken);

        return aggregatedAllocations.ToDictionary(a => a.KPITargetId, a => a.TotalAllocated);
    }

    public async Task<(List<DUKPITargetAssignmentsGroupedResponse> Items, int TotalCount)> GetGroupedAssignmentsAsync(Sieve.Models.SieveModel sieveModel, CancellationToken cancellationToken = default)
    {
        IQueryable<Domain.Entities.Planning.DUKPITargetAssignment> query = context.DUKPITargetAssignments!
            .Include(a => a.DeliveryUnit)
            .ThenInclude(du => du.Office);

        // Apply filters
        query = sieveProcessor.Apply(sieveModel, query, applySorting: false, applyPagination: false);

        var groupedQuery = query
            .GroupBy(a => new { a.KPIId, a.DeliveryUnitId })
            .Select(g => new DUKPITargetAssignmentsGroupedResponse
            {
                DeliveryUnit = new DeliveryUnitGroupedResponse
                {
                    Id = g.Key.DeliveryUnitId,
                    OfficeName = g.First().DeliveryUnit.Office.Name
                },
                DUKPITargets = g.Select(a => new DUKPITargetGroupedResponse
                {   
                    KPIId = g.Key.KPIId,
                    DUKPITargetAssignmentId = a.Id,
                    TargetId = a.KPITargetId,
                    AllocatedTargetValue = a.AllocatedTargetValue
                }).ToList()
            });

        var totalCount = await groupedQuery.CountAsync(cancellationToken);

        // For now, order by KPIId, skip sorting from sieveModel as it's complex for grouped data
        var items = await groupedQuery
            .OrderBy(x => x.DeliveryUnit.Id)
            .Skip(((sieveModel.Page ?? 1) - 1) * (sieveModel.PageSize ?? 10))
            .Take(sieveModel.PageSize ?? 10)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }
}


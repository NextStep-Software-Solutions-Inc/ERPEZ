using Sieve.Services;
using Microsoft.EntityFrameworkCore;
using ERPEZ.Domain.Dtos.Planning;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

#pragma warning disable CS9107 // Parameter is captured into the state of the enclosing type
public class DUKPIAssignmentRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor) : Repository<Domain.Entities.Planning.DUKPIAssignment>(context, sieveProcessor), Domain.Interfaces.IDUKPIAssignmentRepository
#pragma warning restore CS9107
{
    public async Task<Dictionary<Guid, decimal>> GetTotalAllocatedByKPITargetIdsAsync(IEnumerable<Guid> kpiTargetIds, CancellationToken cancellationToken = default)
    {
        var aggregatedAllocations = await ToListAsync(
            context.DUKPIAssignments!
                .Where(a => kpiTargetIds.Contains(a.KPITargetId))
                .GroupBy(a => a.KPITargetId)
                .Select(g => new { KPITargetId = g.Key, TotalAllocated = g.Sum(a => a.AllocatedTargetValue) }),
            cancellationToken);

        return aggregatedAllocations.ToDictionary(a => a.KPITargetId, a => a.TotalAllocated);
    }

    public async Task<(List<DUKPIAssignmentsGroupedResponse> Items, int TotalCount)> GetGroupedAssignmentsAsync(Sieve.Models.SieveModel sieveModel, CancellationToken cancellationToken = default)
    {
        IQueryable<Domain.Entities.Planning.DUKPIAssignment> query = context.DUKPIAssignments!
            .Include(a => a.DeliveryUnit)
            .ThenInclude(du => du.Office);

        // Apply filters
        query = sieveProcessor.Apply(sieveModel, query, applySorting: false, applyPagination: false);

        var groupedQuery = query
            .GroupBy(a => new { a.KPIId, a.DeliveryUnitId })
            .Select(g => new DUKPIAssignmentsGroupedResponse
            {
                DeliveryUnit = new DeliveryUnitGroupedResponse
                {
                    Id = g.Key.DeliveryUnitId,
                    OfficeName = g.First().DeliveryUnit.Office.Name
                },
                DUKPITargets = g.Select(a => new DUKPITargetGroupedResponse
                {   
                    KPIId = g.Key.KPIId,
                    DUKPIAssignmentId = a.Id,
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


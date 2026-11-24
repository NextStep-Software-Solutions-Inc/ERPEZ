using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Dtos.Planning;

namespace ERPEZ.Domain.Interfaces;

public interface IDUKPITargetAssignmentRepository : IRepository<DUKPITargetAssignment>
{
    Task<Dictionary<Guid, decimal>> GetTotalAllocatedByKPITargetIdsAsync(IEnumerable<Guid> kpiTargetIds, CancellationToken cancellationToken = default);
    Task<(List<DUKPITargetAssignmentsGroupedResponse> Items, int TotalCount)> GetGroupedAssignmentsAsync(Sieve.Models.SieveModel sieveModel, CancellationToken cancellationToken = default);
}


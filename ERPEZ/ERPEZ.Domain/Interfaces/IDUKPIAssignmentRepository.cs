using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Dtos.Planning;

namespace ERPEZ.Domain.Interfaces;

public interface IDUKPIAssignmentRepository : IRepository<DUKPIAssignment>
{
    Task<Dictionary<Guid, decimal>> GetTotalAllocatedByKPITargetIdsAsync(IEnumerable<Guid> kpiTargetIds, CancellationToken cancellationToken = default);
    Task<(List<DUKPIAssignmentsGroupedResponse> Items, int TotalCount)> GetGroupedAssignmentsAsync(Sieve.Models.SieveModel sieveModel, CancellationToken cancellationToken = default);
}


using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Interfaces;

public interface IDUKPIAssignmentRepository : IRepository<DUKPIAssignment>
{
    Task<Dictionary<Guid, decimal>> GetTotalAllocatedByKPITargetIdsAsync(IEnumerable<Guid> kpiTargetIds, CancellationToken cancellationToken = default);
}


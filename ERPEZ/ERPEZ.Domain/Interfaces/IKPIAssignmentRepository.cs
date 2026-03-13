using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Interfaces;

public interface IKPIAssignmentRepository : IRepository<KPIAssignment>
{
    Task<List<KPIAssignment>> GetAssignmentsByFYActiveKPIIdAsync(Guid fyActiveKPIId, CancellationToken cancellationToken = default);
}

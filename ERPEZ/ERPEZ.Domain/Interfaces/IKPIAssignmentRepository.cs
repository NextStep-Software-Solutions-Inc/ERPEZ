using ERPEZ.Domain.Entities.Planning;
using Sieve.Models;

namespace ERPEZ.Domain.Interfaces;

public interface IKPIAssignmentRepository : IRepository<KPIAssignment>
{
    Task<List<KPIAssignment>> GetAssignmentsByFYActiveKPIIdAsync(Guid fyActiveKPIId, CancellationToken cancellationToken = default);
    Task<(IEnumerable<KPIAssignment>, int)> GetAllWithDetailsAsync(SieveModel sieveModel, CancellationToken cancellationToken = default);
    Task<KPIAssignment?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
}

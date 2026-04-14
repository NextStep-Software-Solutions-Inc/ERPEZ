using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Interfaces;

public interface IOfficeCeilingRepository : IRepository<OfficeCeiling>
{
	Task<OfficeCeiling?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
	Task<List<OfficeCeiling>> GetAllWithDetailsAsync(bool includeDeleted = false, CancellationToken cancellationToken = default);
}
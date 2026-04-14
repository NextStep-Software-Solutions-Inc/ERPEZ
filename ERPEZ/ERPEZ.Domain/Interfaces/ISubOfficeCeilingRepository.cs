using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Interfaces;

public interface ISubOfficeCeilingRepository : IRepository<SubOfficeCeiling>
{
	Task<SubOfficeCeiling?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
	Task<List<SubOfficeCeiling>> GetAllWithDetailsAsync(bool includeDeleted = false, CancellationToken cancellationToken = default);
}
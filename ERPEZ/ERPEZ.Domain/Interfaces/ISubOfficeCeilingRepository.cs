using ERPEZ.Domain.Entities.Planning;
using Sieve.Models;

namespace ERPEZ.Domain.Interfaces;

public interface ISubOfficeCeilingRepository : IRepository<SubOfficeCeiling>
{
	Task<SubOfficeCeiling?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
	Task<(IEnumerable<SubOfficeCeiling>, int)> GetAllWithDetailsAsync(SieveModel sieveModel, CancellationToken cancellationToken = default);
	Task<List<SubOfficeCeiling>> GetAllWithDetailsAsync(bool includeDeleted = false, CancellationToken cancellationToken = default);
}
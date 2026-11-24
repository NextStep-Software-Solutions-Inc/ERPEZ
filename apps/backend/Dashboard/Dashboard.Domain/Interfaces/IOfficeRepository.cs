using ERPEZ.Domain.Entities.Planning;
using Sieve.Models;

namespace ERPEZ.Domain.Interfaces;

public interface IOfficeRepository : IRepository<Office>
{
    Task<Office?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<Office>> GetAllWithDetailsAsync(bool includeDeleted = false, CancellationToken cancellationToken = default);
    Task<(IEnumerable<Office>, int)> GetAllWithDetailsAsync(SieveModel sieveModel, CancellationToken cancellationToken = default);
}

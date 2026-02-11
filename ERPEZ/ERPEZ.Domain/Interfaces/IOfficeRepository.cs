using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Interfaces;

public interface IOfficeRepository : IRepository<Office>
{
    Task<Office?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<Office>> GetAllWithDetailsAsync(bool includeDeleted = false, CancellationToken cancellationToken = default);
}

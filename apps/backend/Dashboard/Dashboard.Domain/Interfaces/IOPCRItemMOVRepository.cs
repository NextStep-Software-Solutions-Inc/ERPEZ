using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Interfaces;

public interface IOPCRItemMOVRepository : IRepository<OPCRItemMOV>
{
    Task<List<OPCRItemMOV>> GetByOPCRItemIdAsync(
        Guid opcrItemId, CancellationToken cancellationToken = default);
}
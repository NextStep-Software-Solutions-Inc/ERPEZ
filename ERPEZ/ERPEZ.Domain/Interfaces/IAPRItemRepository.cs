using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Interfaces;

public interface IAPRItemRepository : IRepository<APRItem>
{
    Task<List<APRItem>> GetByAPRIdAsync(Guid aprId, CancellationToken cancellationToken = default);
}

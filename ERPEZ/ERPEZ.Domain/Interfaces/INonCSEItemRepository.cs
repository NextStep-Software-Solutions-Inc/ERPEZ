using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Interfaces;

public interface INonCSEItemRepository : IRepository<NonCSEItem>
{
    Task<List<NonCSEItem>> GetActiveItemsAsync(CancellationToken cancellationToken = default);
}

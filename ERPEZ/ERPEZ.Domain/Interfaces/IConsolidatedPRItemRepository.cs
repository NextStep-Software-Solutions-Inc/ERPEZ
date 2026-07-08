using ERPEZ.Domain.Entities.Procurement;

namespace ERPEZ.Domain.Interfaces;

public interface IConsolidatedPRItemRepository : IRepository<ConsolidatedPRItem>
{
    Task<List<ConsolidatedPRItem>> GetByIdsWithDetailsAsync(
    IEnumerable<Guid> ids, CancellationToken cancellationToken = default);
}
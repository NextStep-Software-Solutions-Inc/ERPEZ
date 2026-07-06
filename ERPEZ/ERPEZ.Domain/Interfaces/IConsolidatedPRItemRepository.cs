using ERPEZ.Domain.Entities.Procurement;

namespace ERPEZ.Domain.Interfaces;

public interface IConsolidatedPRItemRepository : IRepository<ConsolidatedPRItem>
{
    Task<ConsolidatedPRItem?> GetByIdWithDetailsAsync(
        Guid id, CancellationToken cancellationToken = default);
}
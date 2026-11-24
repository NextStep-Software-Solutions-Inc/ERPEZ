using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Interfaces;

public interface IProcurementItemRepository : IRepository<ProcurementItem>
{
    /// <summary>
    /// Get procurement items with all related entities loaded.
    /// </summary>
    Task<ProcurementItem?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get all procurement items with related entities loaded.
    /// </summary>
    Task<List<ProcurementItem>> GetAllWithDetailsAsync(bool includeInactive = false, CancellationToken cancellationToken = default);
}

using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Interfaces;

public interface IItemPriceRepository : IRepository<ItemPrice>
{
    /// <summary>
    /// Get item price with related ProcurementItem and FiscalYear loaded.
    /// </summary>
    Task<ItemPrice?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get all item prices with related entities loaded.
    /// </summary>
    Task<List<ItemPrice>> GetAllWithDetailsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Check if a price entry exists for a specific item and fiscal year.
    /// </summary>
    Task<bool> ExistsAsync(Guid procurementItemId, Guid fiscalYearId, CancellationToken cancellationToken = default);
}

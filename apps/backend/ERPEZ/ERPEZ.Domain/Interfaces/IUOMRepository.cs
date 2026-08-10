using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Interfaces;

public interface IUOMRepository : IRepository<UOM>
{
    /// <summary>
    /// Check if UOM is in use by any active procurement items.
    /// </summary>
    Task<bool> IsInUseAsync(Guid uomId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get UOM by ID with Parent navigation property included.
    /// </summary>
    Task<UOM?> GetByIdWithNavigationAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Check if UOM has child UOMs.
    /// </summary>
    Task<bool> HasChildrenAsync(Guid uomId, CancellationToken cancellationToken = default);
}

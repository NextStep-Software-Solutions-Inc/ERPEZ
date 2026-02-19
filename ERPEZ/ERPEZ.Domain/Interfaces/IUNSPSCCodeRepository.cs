using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Interfaces;

public interface IUNSPSCCodeRepository : IRepository<UNSPSCCode>
{
    /// <summary>
    /// Check if UNSPSC Code is in use by any active procurement items.
    /// </summary>
    Task<bool> IsInUseAsync(Guid unspscCodeId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get UNSPSC Code by ID with Parent navigation property included.
    /// </summary>
    Task<UNSPSCCode?> GetByIdWithNavigationAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get children of UNSPSC Code by parent ID.
    /// </summary>
    Task<List<UNSPSCCode>> GetChildrenAsync(Guid parentId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Check if UNSPSC Code has children.
    /// </summary>
    Task<bool> HasChildrenAsync(Guid unspscCodeId, CancellationToken cancellationToken = default);
}

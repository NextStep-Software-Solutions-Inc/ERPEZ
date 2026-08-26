using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Interfaces;

public interface IProcurementModeRepository : IRepository<ProcurementMode>
{
    /// <summary>
    /// Get procurement mode by ID with ProcurementCategory navigation property included.
    /// </summary>
    Task<ProcurementMode?> GetByIdWithNavigationAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Check if procurement category has references from procurement modes.
    /// </summary>
    Task<bool> HasReferencesByProcurementCategoryAsync(Guid procurementCategoryId, CancellationToken cancellationToken = default);
}

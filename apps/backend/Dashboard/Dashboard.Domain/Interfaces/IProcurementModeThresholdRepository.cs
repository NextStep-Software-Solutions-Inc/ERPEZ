using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Interfaces;

public interface IProcurementModeThresholdRepository : IRepository<ProcurementModeThreshold>
{
    /// <summary>
    /// Get procurement mode threshold by ID with ProcurementMode navigation property included.
    /// </summary>
    Task<ProcurementModeThreshold?> GetByIdWithNavigationAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Check if there is an overlapping date range for the same procurement mode.
    /// </summary>
    Task<bool> HasOverlappingDateRangeAsync(Guid procurementModeId, DateTime effectivityStart, DateTime? effectivityEnd, Guid? excludeId = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Check if procurement mode has thresholds.
    /// </summary>
    Task<bool> HasReferencesByProcurementModeAsync(Guid procurementModeId, CancellationToken cancellationToken = default);
}

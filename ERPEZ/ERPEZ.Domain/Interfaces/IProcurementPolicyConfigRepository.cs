using ERPEZ.Domain.Entities.Planning;

namespace ERPEZ.Domain.Interfaces;

public interface IProcurementPolicyConfigRepository : IRepository<ProcurementPolicyConfig>
{
    /// <summary>
    /// Get procurement policy config by ID with FiscalYear, ProcurementMode, and ProcurementModeThreshold navigation properties included.
    /// </summary>
    Task<ProcurementPolicyConfig?> GetByIdWithNavigationAsync(Guid id, CancellationToken cancellationToken = default);
}

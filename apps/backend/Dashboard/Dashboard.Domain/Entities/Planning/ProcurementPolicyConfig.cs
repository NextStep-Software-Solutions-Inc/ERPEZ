using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Represents fiscal year-specific procurement policy configurations with snapshotted thresholds.
/// </summary>
public class ProcurementPolicyConfig : TenantScopedEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid FiscalYearId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid ProcurementModeId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid ProcurementModeThresholdId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal MinAmount { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal? MaxAmount { get; set; }

    // Navigation Properties
    public virtual FiscalYear? FiscalYear { get; set; }
    public virtual ProcurementMode? ProcurementMode { get; set; }
    public virtual ProcurementModeThreshold? ProcurementModeThreshold { get; set; }
}

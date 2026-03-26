using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Represents a snapshot of KPI for a specific fiscal year. 
/// Cloned from Master KPI during activation to ensure immutability.
/// </summary>
public class FYActiveKPI : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid FiscalYearId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid MasterKPIId { get; set; } // Lineage link to Master KPI

    // Snapshotted Metadata from Master KPI
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? ParentKPIId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? MFOPAPId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string Code { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string? Description { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string MeasurementUnit { get; set; } = string.Empty; // Enum stored as string

    [Sieve(CanFilter = true, CanSort = true)]
    public string DistributionBehavior { get; set; } = string.Empty; // Enum stored as string

    [Sieve(CanFilter = true, CanSort = true)]
    public string FunctionCategory { get; set; } = string.Empty; // Enum stored as string

    [Sieve(CanFilter = true, CanSort = true)]
    public string? MonitoringFrequency { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsOptInAvailable { get; set; } = false;

    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsGAD { get; set; } = false;

    [Sieve(CanFilter = true, CanSort = true)]
    public string Status { get; set; } = "Active";

    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsLocked { get; set; } = false;

    // Agency-Level Targets (Level 1)
    [Sieve(CanFilter = true, CanSort = true)]
    public decimal AgencyTargetAnnual { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal? AgencyTargetQ1 { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal? AgencyTargetQ2 { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal? AgencyTargetQ3 { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal? AgencyTargetQ4 { get; set; }

    // Navigation Properties
    public virtual FiscalYear? FiscalYear { get; set; }
    public virtual KPI? MasterKPI { get; set; }
    public virtual FYActiveKPI? ParentFYActiveKPI { get; set; }
    public virtual MFOPAP? MFOPAP { get; set; }
    public virtual List<FYActiveKPI> ChildFYActiveKPIs { get; set; } = [];
    public virtual List<FYActiveKPIMeasurement> FYActiveKPIMeasurements { get; set; } = [];
    public virtual List<KPIAssignment> KPIAssignments { get; set; } = [];
}

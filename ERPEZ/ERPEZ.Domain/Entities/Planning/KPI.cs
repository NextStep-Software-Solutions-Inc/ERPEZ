using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class KPI : BaseEntity
{
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
    public string? MonitoringFrequency { get; set; } // Enum stored as string, Optional

    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsOptInAvailable { get; set; } = false;

    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsGAD { get; set; } = false;

    [Sieve(CanFilter = true, CanSort = true)]
    public string Status { get; set; } = "Active"; // Active or Inactive

    [Sieve(CanFilter = true, CanSort = true)]
    public string? GadMeasure { get; set; }
    
    // Navigation Properties
    public virtual KPI? ParentKPI { get; set; }
    public virtual MFOPAP? MFOPAP { get; set; }
    public virtual List<KPI> ChildKPIs { get; set; } = [];
    public virtual List<KPIMeasurement> KPIMeasurements { get; set; } = [];
    public virtual List<SDG> SDGs { get; set; } = [];
    public virtual List<Attribute> Attributes { get; set; } = [];
    public virtual List<FYActiveKPI> FYActiveKPIs { get; set; } = [];
    
    // Legacy navigation properties (keep for backward compatibility)
    public virtual List<KPIModeOfVerification> KPIModeOfVerifications { get; set; } = [];
    public virtual List<DUKPITargetAssignment> KPITargetAssignments { get; set; } = [];
    public virtual List<MFOPAP> MFOPAPs { get; set; } = [];
    public virtual List<OPCRActivity> OPCRActivities { get; set; } = [];
    public virtual List<KPITarget> KPITargets { get; set; } = [];
    public virtual List<KPIPerformanceMeasure> KPIPerformanceMeasures { get; set; } = [];
}

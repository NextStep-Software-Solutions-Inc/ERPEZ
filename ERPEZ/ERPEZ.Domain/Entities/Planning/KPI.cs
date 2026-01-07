using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class KPI : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? ParentKPIId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string FunctionType { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string? Description { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsOfficeMandate { get; set; } = false;

    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsPercentage { get; set; } = false;

    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsTargetValueAllocable { get; set; } = false;

    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsFixed { get; set; } = false;

    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsGlobal { get; set; } = false;

    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsMultiple { get; set; } = false;

    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsActive { get; set; } = true;
    public string Status { get; set; } = string.Empty;
    public virtual KPI? ParentKPI { get; set; }
    public virtual List<KPIModeOfVerification> KPIModeOfVerifications { get; set; } = [];
    public virtual List<DUKPITargetAssignment> KPIAssignments { get; set; } = [];
    public virtual List<MFOPAP> MFOPAPs { get; set; } = [];
    public virtual List<OPCRActivity> OPCRActivities { get; set; } = [];
    public virtual List<KPITarget> KPITargets { get; set; } = [];
    public virtual List<KPI> ChildKPIs { get; set; } = [];
    public virtual List<SDG> SDGs { get; set; } = [];
    public virtual List<Attribute> Attributes { get; set; } = [];
    public virtual List<KPIPerformanceMeasure> KPIPerformanceMeasures { get; set; } = [];
}

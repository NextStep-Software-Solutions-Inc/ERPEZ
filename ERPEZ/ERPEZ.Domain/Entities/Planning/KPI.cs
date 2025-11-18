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
    public bool IsOfficeMandate { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsPercentage { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public bool IsTargetValueAllocable { get; set; }

    public string Status { get; set; } = string.Empty;
    public virtual KPI? ParentKPI { get; set; }
    public virtual List<KPIRating> KPIRatings { get; set; } = [];
    public virtual List<KPIModeOfVerification> KPIModeOfVerifications { get; set; } = [];
    public virtual List<DUKPIAssignment> KPIAssignments { get; set; } = [];
    public virtual List<MFOKPI> MFOKPIs { get; set; } = [];
    public virtual List<OPCRKPI> OPCRKPIs { get; set; } = [];
    public virtual List<KPITarget> KPITargets { get; set; } = [];
    public virtual List<KPI> ParentKPIs { get; set; } = [];
    public virtual List<SDG> SDGs { get; set; } = [];
    public virtual List<Attribute> Attributes { get; set; } = [];
}

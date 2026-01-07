using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class DeliveryUnit : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid OfficeId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? ParentId { get; set; }
    public virtual List<DUKPITargetAssignment> KPITargetAssignments { get; set; } = [];
    public virtual List<DUAllocation> DUAllocations { get; set; } = [];
    public virtual List<DeliveryUnit> SubDeliveryUnits { get; set; } = [];
    public virtual List<WFP> WFPs { get; set; } = [];
    public virtual List<WFPPAPDepartment> WFPPAPDepartments { get; set; } = [];
    public virtual List<OPCRPAPDepartment> OPCRPAPDepartments { get; set; } = [];
    public virtual List<OPCR> OPCRs { get; set; } = [];
    public virtual List<OPCRActivity> OPCRActivities { get; set; } = [];
    public virtual Office Office { get; set; } = null!;
}

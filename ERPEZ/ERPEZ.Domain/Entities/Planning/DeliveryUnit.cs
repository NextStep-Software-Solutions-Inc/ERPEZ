using ERPEZ.Domain.Common;
using Sieve.Attributes;
using System.Text.Json.Serialization;

namespace ERPEZ.Domain.Entities.Planning;

public class DeliveryUnit : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid OfficeId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? ParentDUId { get; set; }
    public List<KPIAssignment> KPIAssignments { get; set; } = [];
    public List<DUAllocation> DUAllocations { get; set; } = [];
    public List<SubDeliveryUnit> SubDeliveryUnits { get; set; } = [];
    public List<WFP> WFPs { get; set; } = [];
    public List<WFPPAPDepartment> WFPPAPDepartments { get; set; } = [];
    public List<OPCR> OPCRs { get; set; } = [];
    public List<OPCRActivity> OPCRActivities { get; set; } = [];
    public virtual Office Office { get; set; } = null!;
}

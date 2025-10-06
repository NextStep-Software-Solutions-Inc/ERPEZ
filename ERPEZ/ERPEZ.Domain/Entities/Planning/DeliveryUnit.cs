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
    public List<KPIAssignment> KPIAssignments { get; set; } = null!;
    public List<DUAllocation> DUAllocations { get; set; } = null!;
    public List<SubDeliveryUnit> SubDeliveryUnits { get; set; } = null!;
    public List<WFP> WFPs { get; set; } = null!;
    public List<WFPPAPDepartment> WFPPAPDepartments { get; set; } = null!;
    public List<OPCR> OPCRs { get; set; } = null!;
    public List<OPCRActivity> OPCRActivities { get; set; } = null!;
    [JsonIgnore]
    public virtual Office Office { get; set; } = null!;
}

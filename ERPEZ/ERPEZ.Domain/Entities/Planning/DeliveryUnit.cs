using ERPEZ.Domain.Common;
using System.Text.Json.Serialization;

namespace ERPEZ.Domain.Entities.Planning;

public class DeliveryUnit : BaseEntity
{
    public Guid OfficeId { get; set; }
    public Guid? ParentDUId { get; set; }
    public List<KPIAssignment> KPIAssignments { get; set; } = null!;
    public List<DUAllocation> DUAllocations { get; set; } = null!;
    public List<SubDeliveryUnit> SubDeliveryUnits { get; set; } = null!;
    public List<WFP> WFPs { get; set; } = null!;
    public List<WFPPAPDepartment> WFPPADepartments { get; set; } = null!;
    public List<OPCR> OPCRs { get; set; } = null!;
    [JsonIgnore]
    public virtual Office Office { get; set; } = null!;
}

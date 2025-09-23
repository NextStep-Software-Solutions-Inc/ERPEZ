using ERPEZ.Domain.Common;

namespace ERPEZ.Domain.Entities.Planning;

public class WFPPAPDepartment : BaseEntity
{
    public Guid OPCRActivityId { get; set; }
    public Guid DeliveryUnitId { get; set; }
}

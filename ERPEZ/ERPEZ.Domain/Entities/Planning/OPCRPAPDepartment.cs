using ERPEZ.Domain.Common;

namespace ERPEZ.Domain.Entities.Planning;

public class OPCRPAPDepartment :BaseEntity
{
    public Guid OPCRActivityId { get; set; }
    public Guid DeliveryUnitId { get; set; }
}

using ERPEZ.Domain.Common;

namespace ERPEZ.Domain.Entities.Planning;

public class OPCRPAPDepartment :BaseEntity
{
    public Guid OPCRActivityId { get; set; }
    public Guid DeliveryUnitId { get; set; }
    public virtual OPCRActivity OPCRActivity { get; set; } = null!;
    public virtual DeliveryUnit DeliveryUnit { get; set; } = null!;

}

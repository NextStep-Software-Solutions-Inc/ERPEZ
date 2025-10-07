using ERPEZ.Domain.Common;

namespace ERPEZ.Domain.Entities.Planning;

public class WFPPAPDepartment : BaseEntity
{
    public Guid WFPPAPId { get; set; }
    public Guid SubDeliveryUnitId { get; set; }
    public virtual SubDeliveryUnit SubDeliveryUnit { get; set; } = null!;
    public virtual WFPPAP WFPPAP { get; set; } = null!;
}

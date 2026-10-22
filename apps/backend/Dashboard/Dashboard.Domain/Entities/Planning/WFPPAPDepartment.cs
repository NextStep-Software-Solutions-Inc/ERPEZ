using ERPEZ.Domain.Common;

namespace ERPEZ.Domain.Entities.Planning;

public class WFPPAPDepartment : TenantScopedEntity
{
    public Guid WFPPAPId { get; set; }
    public Guid DeliveryUnitId { get; set; }
    public virtual DeliveryUnit DeliveryUnit { get; set; } = null!;
    public virtual WFPPAP WFPPAP { get; set; } = null!;
}

using ERPEZ.Domain.Common;

namespace ERPEZ.Domain.Entities.Planning;

public class SubDUAllocation : BaseEntity
{
    public Guid DUAllocationId { get; set; }
    public Guid SubDeliveryUnitId { get; set; }
    public string Amount { get; set; } = string.Empty;

    public virtual DUAllocation DUAllocation { get; set; } = null!;
    public virtual SubDeliveryUnit SubDeliveryUnit { get; set; } = null!;
}

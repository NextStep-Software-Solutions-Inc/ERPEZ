using ERPEZ.Domain.Common;

namespace ERPEZ.Domain.Entities.Planning;

public class SubDUAllocation : BaseEntity
{
    public Guid DUAllocationId { get; set; }
    public Guid SubDeliveryUnitId { get; set; }
    public decimal Amount { get; set; }

    public virtual DUAllocation DUAllocation { get; set; } = null!;
    public virtual SubDeliveryUnit SubDeliveryUnit { get; set; } = null!;
}

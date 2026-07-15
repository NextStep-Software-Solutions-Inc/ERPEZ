using ERPEZ.Domain.Common;
using System;

namespace ERPEZ.Domain.Entities.Procurement;

public class PurchaseOrderItem : BaseEntity
{
    public Guid PurchaseOrderId { get; set; }
    public Guid SourceItemId { get; set; }
    
    public string? Description { get; set; }
    public int Quantity { get; set; }
    public string? Unit { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Amount { get; set; }

    public virtual PurchaseOrder? PurchaseOrder { get; set; }
}

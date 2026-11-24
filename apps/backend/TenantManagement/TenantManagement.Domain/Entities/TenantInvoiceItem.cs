using ERPEZ.TenantManagement.Domain.Common;
using System.Text.Json.Serialization;

namespace ERPEZ.TenantManagement.Domain.Entities;

public class TenantInvoiceItem : BaseEntity
{
    public TenantInvoiceItem() { }

    public Guid TenantInvoiceId { get; set; }
    public string Description { get; set; } = string.Empty;
    public int Quantity { get; set; } = 1;
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }

    [JsonIgnore]
    public virtual TenantInvoice TenantInvoice { get; set; } = null!;
}

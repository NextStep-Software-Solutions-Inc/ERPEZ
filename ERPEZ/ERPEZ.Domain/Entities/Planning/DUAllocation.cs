using ERPEZ.Domain.Common;

namespace ERPEZ.Domain.Entities.Planning;

public class DUAllocation : BaseEntity
{
    public Guid DeliveryUnitId { get; set; }
    public string Purpose { get; set; } = string.Empty;
    public string Amount { get; set; } = string.Empty;
    public virtual OPCR OPCR { get; set; } = null!;
}

using ERPEZ.Domain.Common;

namespace ERPEZ.Domain.Entities.Planning;

public class OPCR : BaseEntity
{
    public Guid DUAllocationId { get; set; }
    public Guid DeliveryUnitId { get; set; }
    public int FiscalYear { get; set; }
    public string Status { get; set; } = string.Empty;
    public virtual OPCREvaluation OPCREvaluation { get; set; } = null!;

}

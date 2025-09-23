using ERPEZ.Domain.Common;

namespace ERPEZ.Domain.Entities.Planning;

public class KPIAssignment : BaseEntity
{
    public Guid KPIId { get; set; }
    public Guid DeliveryUnitId { get; set; }
}

using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class KPIAssignment : BaseEntity
{

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid KPIId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid DeliveryUnitId { get; set; }
    public virtual KPI KPI { get; set; } = null!;
    public virtual DeliveryUnit DeliveryUnit { get; set; } = null!;
}

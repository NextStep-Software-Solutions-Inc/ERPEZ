using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class DUKPITargetAssignment : TenantScopedEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid KPIId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid DeliveryUnitId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid KPITargetId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public decimal AllocatedTargetValue { get; set; }
    public virtual KPI KPI { get; set; } = null!;
    public virtual DeliveryUnit DeliveryUnit { get; set; } = null!;
    public virtual KPITarget KPITarget { get; set; } = null!;
    public virtual List<OPCR> OPCRs { get; set; } = [];
}

using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class WFPObjectiveActivityExpenditure : TenantScopedEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid WFPObjectiveActivityId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid ObjectId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string? ItemDescription { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public int? Quantity { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal? UnitCost { get; set; }

    public virtual WFPObjectiveActivity WFPObjectiveActivity { get; set; } = null!;
    public virtual Object Object { get; set; } = null!;
}

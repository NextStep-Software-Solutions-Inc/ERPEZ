using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class WFPObjectiveTimeline: BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid WFPObjectiveTargetId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public DateOnly StartDate { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime EndDate { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public decimal TargetValue { get; set; }
    public virtual WFPObjectiveTarget WFPObjectiveTarget { get; set; } = null!;
}

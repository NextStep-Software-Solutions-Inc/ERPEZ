using ERPEZ.Domain.Common;
using ERPEZ.Domain.Enums;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class WFPObjectiveTimeline : TenantScopedEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid WFPObjectiveActivityId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public TimelineTypeEnum TimelineType { get; set; } = TimelineTypeEnum.Quarterly;
    
    [Sieve(CanFilter = true, CanSort = true)]
    public DateOnly StartDate { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public DateOnly EndDate { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public decimal TargetValue { get; set; }
    public virtual WFPObjectiveActivity WFPObjectiveActivity { get; set; } = null!;
}

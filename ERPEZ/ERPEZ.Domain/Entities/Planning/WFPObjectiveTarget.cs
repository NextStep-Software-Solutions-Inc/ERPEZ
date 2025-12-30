using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class WFPObjectiveTarget : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid WFPObjectiveId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public string ActivityName { get; set; } = string.Empty;
    [Sieve(CanFilter = true, CanSort = true)]
    public string Indicator { get; set; } = string.Empty;
    [Sieve(CanFilter = true, CanSort = true)]
    public decimal Weight { get; set; }
    public virtual WFPObjective WFPObjective { get; set; } = null!;
    public virtual List<WFPObjectiveTimeline> WFPObjectiveTimelines { get; set; } = [];
    public virtual List<WFPObjectiveTargetExpenditure> WFPObjectiveTargetExpenditures { get; set; } = [];

}

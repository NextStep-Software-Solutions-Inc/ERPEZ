using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class WFPObjectiveActivity : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid WFPId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? WFPObjectiveId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? OPCRActivityId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public string ActivityName { get; set; } = string.Empty;
    [Sieve(CanFilter = true, CanSort = true)]
    public string Indicator { get; set; } = string.Empty;
    [Sieve(CanFilter = true, CanSort = true)]
    public decimal Weight { get; set; }
    public virtual WFP WFP { get; set; } = null!;
    public virtual WFPObjective? WFPObjective { get; set; }
    public virtual OPCRActivity? OPCRActivity { get; set; }
    public virtual List<WFPObjectiveTimeline> WFPObjectiveTimelines { get; set; } = [];
    public virtual List<WFPObjectiveActivityExpenditure> WFPObjectiveActivityExpenditures { get; set; } = [];
}

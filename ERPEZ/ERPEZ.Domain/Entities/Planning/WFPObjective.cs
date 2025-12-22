using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class WFPObjective : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid WFPId { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public string Description { get; set; } = string.Empty;
    [Sieve(CanFilter = true, CanSort = true)]
    public decimal Weight { get; set; }
    [Sieve(CanFilter = true, CanSort = true)]
    public string? Outcome { get; set; }
    public virtual List<WFPObjectiveTarget> WFPObjectiveTargets { get; set; } = [];
    public virtual WFP WFP { get; set; } = null!;
}

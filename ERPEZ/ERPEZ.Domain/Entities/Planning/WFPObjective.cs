using ERPEZ.Domain.Common;

namespace ERPEZ.Domain.Entities.Planning;

public class WFPObjective : BaseEntity
{
    public Guid WFPId { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Weight { get; set; }
    public virtual List<WFPOutcome> WFPOutcomes  { get; set; } = [];
    public virtual List<WFPObjectiveTarget> WFPObjectiveTargets  { get; set; } = [];
    public virtual WFP WFP { get; set; } = null!; 
}

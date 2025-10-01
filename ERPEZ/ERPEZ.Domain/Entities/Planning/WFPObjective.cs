using ERPEZ.Domain.Common;

namespace ERPEZ.Domain.Entities.Planning;

public class WFPObjective : BaseEntity
{
    public Guid WFPId { get; set; }
    public string Description { get; set; } = string.Empty;
    public List<WFPOutcome> WFPOutcomes  { get; set; } = null!;
    public virtual WFP WFP { get; set; } = null!; 
}

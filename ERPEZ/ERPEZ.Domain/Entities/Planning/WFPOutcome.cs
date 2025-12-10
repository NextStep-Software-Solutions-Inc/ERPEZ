using ERPEZ.Domain.Common;

namespace ERPEZ.Domain.Entities.Planning;

public class WFPOutcome : BaseEntity
{
    public Guid WFPObjectiveId { get; set; }
    public string Description { get; set; } = string.Empty;
    public virtual List<WFPActivity> WFPActivities { get; set; } = [];
    public virtual List<WFPPAP> WFPPAPs { get; set; } = [];
    public virtual WFPObjective WFPObjective { get; set; } = null!;
}

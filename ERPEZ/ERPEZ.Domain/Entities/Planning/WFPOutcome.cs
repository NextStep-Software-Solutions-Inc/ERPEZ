using ERPEZ.Domain.Common;
using System.Text.Json.Serialization;

namespace ERPEZ.Domain.Entities.Planning;

public class WFPOutcome : BaseEntity
{
    public Guid WFPObjectiveId { get; set; }
    public string Description { get; set; } = string.Empty;
    public List<WFPActivity> WFPActivities { get; set; } = null!;
    public List<WFPPAP> WFPPAPs { get; set; } = null!;
    [JsonIgnore]
    public virtual WFPObjective WFPObjective { get; set; } = null!;
}

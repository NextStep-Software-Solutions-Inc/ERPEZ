using ERPEZ.Domain.Common;

namespace ERPEZ.Domain.Entities.Planning;

public class WFPOutcome : BaseEntity
{
    public Guid WFPObjectiveId { get; set; }
    public string Description { get; set; } = string.Empty;
    public virtual WFPActivity WFPActivity { get; set; } = null!;
}

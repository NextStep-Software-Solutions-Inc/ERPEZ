using ERPEZ.Domain.Common;

namespace ERPEZ.Domain.Entities.Planning;

public class WFP : BaseEntity
{
    public Guid DUAllocationId { get; set; }
    public Guid DeliveryUnitId { get; set; }
    public string ProgramTitle { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? FiscalYear { get; set; }
    public decimal ProposedBudget { get; set; }
    public string? GeneralObjective { get; set; }
    public string Status { get; set; } = string.Empty;
    public virtual WFPActivity WFPActivity { get; set; } = null!;
    public virtual WFPObjective WFPObjective { get; set; } = null!;
}

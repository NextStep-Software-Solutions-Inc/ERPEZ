using ERPEZ.Domain.Common;

namespace ERPEZ.Domain.Entities.Planning;

public class ActivityBudgetRequirement : BaseEntity
{
    public Guid WFPActivityId { get; set; }
    public Guid ObjectId { get; set; }
    public string ItemDescription { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal CostEstimates { get; set; }
}

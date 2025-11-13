namespace ERPEZ.Application.Features.Planning.ActivityBudgetRequirement.Dtos;

public class ActivityBudgetRequirementResponse
{
    public Guid Id { get; set; }
    public Guid WFPObjectiveTargetId { get; set; }
    public Guid ObjectId { get; set; }
    public string ItemDescription { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal CostEstimates { get; set; }
    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
}

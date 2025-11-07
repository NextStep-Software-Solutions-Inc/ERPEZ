namespace ERPEZ.Application.Features.Planning.ActivityBudgetRequirement.Dtos;

public class ActivityBudgetRequirementDto
{
    public Guid Id { get; set; }
    public Guid WFPObjectiveTargetId { get; set; }
    public Guid ObjectId { get; set; }
    public string ItemDescription { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal CostEstimates { get; set; }
}

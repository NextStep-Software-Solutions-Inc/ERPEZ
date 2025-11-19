namespace ERPEZ.Application.Features.Planning.ActivityBudgetRequirement.Dtos;

public class UpdateActivityBudgetRequirementRequest
{
    public string? ItemDescription { get; set; }
    public int Quantity { get; set; }
    public decimal CostEstimates { get; set; }
}

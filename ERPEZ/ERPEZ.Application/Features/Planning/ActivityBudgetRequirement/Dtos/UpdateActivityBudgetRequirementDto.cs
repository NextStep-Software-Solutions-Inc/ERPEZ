namespace ERPEZ.Application.Features.Planning.ActivityBudgetRequirement.Dtos;

public class UpdateActivityBudgetRequirementDto
{
    public string? ItemDescription { get; set; }
    public int Quantity { get; set; }
    public decimal CostEstimates { get; set; }
}
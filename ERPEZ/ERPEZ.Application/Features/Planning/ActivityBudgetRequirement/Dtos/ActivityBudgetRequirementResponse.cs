using ERPEZ.Application.Features.Planning.Object.Dtos;

namespace ERPEZ.Application.Features.Planning.ActivityBudgetRequirement.Dtos;

public record ActivityBudgetRequirementResponse
{
    public Guid Id { get; init; }
    public Guid WFPObjectiveTargetId { get; init; }
    public required ObjectResponse Object { get; init; }
    public string? ItemDescription { get; init; } = string.Empty;
    public int Quantity { get; init; }
    public decimal CostEstimates { get; init; }
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
}

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTargetExpenditure.Dtos;

public record CreateWFPObjectiveTargetExpenditureRequest
{
    public Guid ObjectId { get; init; }
    public string ItemDescription { get; init; } = string.Empty;
    public int Quantity { get; init; }
    public decimal CostEstimates { get; init; }
}

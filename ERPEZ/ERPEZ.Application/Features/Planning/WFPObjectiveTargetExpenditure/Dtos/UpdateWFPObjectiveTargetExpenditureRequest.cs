namespace ERPEZ.Application.Features.Planning.WFPObjectiveTargetExpenditure.Dtos;

public record UpdateWFPObjectiveTargetExpenditureRequest
{
    public string? ItemDescription { get; init; }
    public int Quantity { get; init; }
    public decimal CostEstimates { get; init; }
}

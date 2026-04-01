namespace ERPEZ.Application.Features.Planning.WFPObjectiveActivityExpenditure.Dtos;

public record UpdateWFPObjectiveActivityExpenditureRequest
{
    public string? ItemDescription { get; init; }
    public int Quantity { get; init; }
    public decimal UnitCost { get; init; }
}

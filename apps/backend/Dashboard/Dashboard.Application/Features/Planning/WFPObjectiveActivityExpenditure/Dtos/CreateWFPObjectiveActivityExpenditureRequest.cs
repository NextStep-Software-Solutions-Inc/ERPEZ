namespace ERPEZ.Application.Features.Planning.WFPObjectiveActivityExpenditure.Dtos;

public record CreateWFPObjectiveActivityExpenditureRequest
{
    public Guid ObjectId { get; init; }
    public string ItemDescription { get; init; } = string.Empty;
    public int Quantity { get; init; }
    public decimal UnitCost { get; init; }
}

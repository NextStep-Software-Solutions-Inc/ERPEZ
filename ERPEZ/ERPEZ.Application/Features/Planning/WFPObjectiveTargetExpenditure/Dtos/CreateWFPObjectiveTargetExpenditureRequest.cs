namespace ERPEZ.Application.Features.Planning.WFPObjectiveTargetExpenditure.Dtos;

public class CreateWFPObjectiveTargetExpenditureRequest
{
    public Guid ObjectId { get; set; }
    public string ItemDescription { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal CostEstimates { get; set; }
}

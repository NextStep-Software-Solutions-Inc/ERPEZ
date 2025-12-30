namespace ERPEZ.Application.Features.Planning.WFPObjectiveTargetExpenditure.Dtos;

public class UpdateWFPObjectiveTargetExpenditureRequest
{
    public string? ItemDescription { get; set; }
    public int Quantity { get; set; }
    public decimal CostEstimates { get; set; }
}

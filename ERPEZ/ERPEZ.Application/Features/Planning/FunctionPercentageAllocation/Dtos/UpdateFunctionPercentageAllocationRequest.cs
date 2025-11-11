namespace ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Dtos;

public class UpdateFunctionPercentageAllocationRequest{
    public int FiscalYear {  get; set; }
    public string? FunctionType { get; set; }
    public string? Description { get; set; }
    public decimal? Percentage { get; set; }
}

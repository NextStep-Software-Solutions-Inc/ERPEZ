namespace ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Dtos;

public class UpdateFunctionPercentageAllocationByFiscalYearRequest
{
    public string? FunctionType { get; set; }
    public string? Description { get; set; }
    public decimal? Percentage { get; set; }
}

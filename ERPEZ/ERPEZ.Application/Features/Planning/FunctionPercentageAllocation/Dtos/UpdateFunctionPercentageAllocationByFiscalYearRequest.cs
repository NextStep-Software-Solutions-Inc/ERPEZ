namespace ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Dtos;

public class UpdateFunctionPercentageAllocationByFiscalYearRequest
{
    public required string FunctionType { get; set; }
    public decimal Percentage { get; set; }
}

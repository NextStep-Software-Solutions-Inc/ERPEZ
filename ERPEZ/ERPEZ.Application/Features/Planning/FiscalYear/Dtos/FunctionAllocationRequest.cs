namespace ERPEZ.Application.Features.Planning.FiscalYear.Dtos;

public class FunctionAllocationRequest
{
    public string FunctionType { get; set; } = string.Empty;
    public decimal Percentage { get; set; }
}

namespace ERPEZ.Application.Features.Planning.FiscalYear.Dtos;

public class FunctionAllocationResponse
{
    public Guid? Id { get; set; }
    public string FunctionType { get; set; } = string.Empty;
    public decimal Percentage { get; set; }
}

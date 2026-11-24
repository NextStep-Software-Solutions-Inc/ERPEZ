namespace ERPEZ.Application.Features.Planning.FiscalYear.Dtos;

public record FunctionAllocationRequest
{
    public string FunctionType { get; init; } = string.Empty;
    public decimal Percentage { get; init; }
}

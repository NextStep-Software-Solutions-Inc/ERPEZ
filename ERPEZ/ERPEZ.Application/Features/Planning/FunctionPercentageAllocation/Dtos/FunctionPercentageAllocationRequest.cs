namespace ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Dtos;

public record FunctionPercentageAllocationRequest
{
    public required string FunctionType { get; init; }
    public required int FiscalYear { get; init; }
    public string? Description { get; init; }
    public required decimal Percentage { get; init; }
}

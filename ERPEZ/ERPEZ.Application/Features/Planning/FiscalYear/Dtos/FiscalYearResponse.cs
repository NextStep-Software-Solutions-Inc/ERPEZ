namespace ERPEZ.Application.Features.Planning.FiscalYear.Dtos;

public record FiscalYearResponse
{
    public Guid Id { get; init; }
    public int Year { get; init; }
    public string? Description { get; init; }
    public string Status { get; init; } = "setup";
    public List<FunctionAllocationResponse> FunctionAllocations { get; init; } = [];
}

namespace ERPEZ.Application.Features.Planning.FiscalYear.Dtos;

public record FiscalYearResponse
{
    public Guid Id { get; init; }
    public int Year { get; init; }
    public string? Description { get; init; }
    public bool IsLocked { get; init; }
    public List<FunctionAllocationResponse> FunctionAllocations { get; init; } = [];
}

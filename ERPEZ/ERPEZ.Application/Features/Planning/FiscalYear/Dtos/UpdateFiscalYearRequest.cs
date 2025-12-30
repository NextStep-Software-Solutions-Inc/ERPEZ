namespace ERPEZ.Application.Features.Planning.FiscalYear.Dtos;

public record UpdateFiscalYearRequest
{
    public string? Description { get; init; }
    public List<FunctionAllocationRequest> FunctionAllocations { get; init; } = new();
}

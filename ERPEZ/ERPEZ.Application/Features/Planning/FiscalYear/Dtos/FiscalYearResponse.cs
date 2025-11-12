namespace ERPEZ.Application.Features.Planning.FiscalYear.Dtos;

public class FiscalYearResponse
{
    public Guid Id { get; set; }
    public int Year { get; set; }
    public string? Description { get; set; }
    public bool IsLocked { get; set; }
    public List<FunctionAllocationResponse> FunctionAllocations { get; set; } = [];
}

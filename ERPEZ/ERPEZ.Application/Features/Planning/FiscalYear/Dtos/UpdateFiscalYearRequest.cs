namespace ERPEZ.Application.Features.Planning.FiscalYear.Dtos;

public class UpdateFiscalYearRequest
{
    public string? Description { get; set; }
    public List<FunctionAllocationRequest> FunctionAllocations { get; set; } = new();
}

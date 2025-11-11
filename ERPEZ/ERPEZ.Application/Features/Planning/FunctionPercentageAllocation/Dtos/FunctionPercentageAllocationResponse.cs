namespace ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Dtos;

public class FunctionPercentageAllocationResponse
{
    public Guid Id { get; set; }
    public int FiscalYear { get; set; }
    public string FunctionType { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Percentage { get; set; }
    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
}

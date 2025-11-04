namespace ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Dtos;

public class FunctionPercentageAllocationDto
{
    public Guid Id { get; set; }
    public string Function { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Percentage { get; set; }
}

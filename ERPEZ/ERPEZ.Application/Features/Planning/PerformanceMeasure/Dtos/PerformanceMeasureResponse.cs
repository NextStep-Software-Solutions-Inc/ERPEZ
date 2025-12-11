namespace ERPEZ.Application.Features.Planning.PerformanceMeasure.Dtos;

public class PerformanceMeasureResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}

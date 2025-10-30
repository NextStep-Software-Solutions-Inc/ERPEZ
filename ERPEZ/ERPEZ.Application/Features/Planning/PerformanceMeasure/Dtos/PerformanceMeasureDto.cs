namespace ERPEZ.Application.Features.Planning.PerformanceMeasure.Dtos;

public class PerformanceMeasureDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}

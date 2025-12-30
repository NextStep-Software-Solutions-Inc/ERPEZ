namespace ERPEZ.Application.Features.Planning.PerformanceMeasure.Dtos;

public record UpdatePerformanceMeasureRequest
{
    public string? Name { get; init; }
    public string? Description { get; init; }
}

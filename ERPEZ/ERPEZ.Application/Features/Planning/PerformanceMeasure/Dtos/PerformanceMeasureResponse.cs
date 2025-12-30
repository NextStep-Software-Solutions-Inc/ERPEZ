namespace ERPEZ.Application.Features.Planning.PerformanceMeasure.Dtos;

public record PerformanceMeasureResponse
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
}

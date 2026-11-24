namespace ERPEZ.Application.Features.Planning.KPIPerformanceMeasure.Dtos;

public record KPIPerformanceMeasureDetailedResponse
{
    public Guid Id { get; init; }
    public Guid KPIId { get; init; }
    public Guid PerformanceMeasureId { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
    public string? CreatedByUser { get; init; }
    public string? UpdatedByUser { get; init; }
}

namespace ERPEZ.Application.Features.Planning.KPIPerformanceMeasure.Dtos;

public record KPIPerformanceMeasureResponse
{
    public Guid Id { get; init; }
    public Guid KPIId { get; init; }
    public Guid PerformanceMeasureId { get; init; }
    public DateTime CreatedAt { get; init; }
}

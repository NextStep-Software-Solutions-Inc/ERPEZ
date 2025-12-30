namespace ERPEZ.Application.Features.Planning.KPIPerformanceMeasure.Dtos;

public record CreateKPIPerformanceMeasureRequest
{
    public required Guid KPIId { get; init; }
    public required Guid PerformanceMeasureId { get; init; }
}

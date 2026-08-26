namespace ERPEZ.Application.Features.Planning.KPIPerformanceMeasure.Dtos;

public record UpdateKPIPerformanceMeasureRequest
{
    public Guid? KPIId { get; init; }
    public Guid? PerformanceMeasureId { get; init; }
}

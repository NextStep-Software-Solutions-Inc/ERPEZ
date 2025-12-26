namespace ERPEZ.Application.Features.Planning.KPIPerformanceMeasure.Dtos;

public class CreateKPIPerformanceMeasureRequest
{
    public required Guid KPIId { get; set; }
    public required Guid PerformanceMeasureId { get; set; }
}

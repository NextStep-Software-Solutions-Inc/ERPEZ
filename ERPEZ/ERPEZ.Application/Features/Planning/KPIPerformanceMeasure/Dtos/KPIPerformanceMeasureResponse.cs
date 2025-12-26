namespace ERPEZ.Application.Features.Planning.KPIPerformanceMeasure.Dtos;

public class KPIPerformanceMeasureResponse
{
    public Guid Id { get; set; }
    public Guid KPIId { get; set; }
    public Guid PerformanceMeasureId { get; set; }
    public DateTime CreatedAt { get; set; }
}

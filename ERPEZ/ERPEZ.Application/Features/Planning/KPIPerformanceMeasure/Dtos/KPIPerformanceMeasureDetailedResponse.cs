namespace ERPEZ.Application.Features.Planning.KPIPerformanceMeasure.Dtos;

public class KPIPerformanceMeasureDetailedResponse
{
    public Guid Id { get; set; }
    public Guid KPIId { get; set; }
    public Guid PerformanceMeasureId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? CreatedByUser { get; set; }
    public string? UpdatedByUser { get; set; }
}

namespace ERPEZ.Application.Features.Planning.KPIRating.Dtos;

public class KPIRatingResponse
{
    public Guid Id { get; set; }
    public Guid KPIId { get; set; }
    public Guid PerformanceMeasureId { get; set; }
    public int NumericalRating { get; set; }
    public string? Remarks { get; set; }
    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
}

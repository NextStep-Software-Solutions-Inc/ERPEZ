namespace ERPEZ.Application.Features.Planning.KPI.Dtos;

public class CreateKPIRatingRequest
{
    public Guid KPIId { get; set; }
    public Guid PerformanceMeasureId { get; set; }
    public List<NumericalRatingRequest> NumericalRatings { get; set; } = [];
}
public class NumericalRatingRequest
{
    public int NumericalRating { get; set; }
    public string? Remarks { get; set; }

}

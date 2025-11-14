namespace ERPEZ.Application.Features.Planning.KPI.Dtos;

public class CreateKPIRatingRequest
{
    public Guid PerformanceMeasureId { get; set; }
    public int NumericalRating { get; set; }
}

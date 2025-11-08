namespace ERPEZ.Application.Features.Planning.OPCRRating.Dtos;

public class OPCRRatingDto
{
    public Guid Id { get; set; }
    public Guid OPCREvaluationId { get; set; }
    public Guid PerformanceMeasureId { get; set; }
    public Guid OPCRKPIId { get; set; }
    public int NumericalRating { get; set; }
    public string? Remarks { get; set; }
}

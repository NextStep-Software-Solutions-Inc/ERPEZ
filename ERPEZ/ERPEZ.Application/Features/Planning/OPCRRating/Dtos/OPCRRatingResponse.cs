namespace ERPEZ.Application.Features.Planning.OPCRRating.Dtos;

public class OPCRRatingResponse
{
    public Guid Id { get; set; }
    public Guid OPCREvaluationId { get; set; }
    public Guid PerformanceMeasureId { get; set; }
    public Guid OPCRId { get; set; }
    public Guid DUKPIAssignmentId { get; set; }
    public int NumericalRating { get; set; }
    public string? Remarks { get; set; }
    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
}

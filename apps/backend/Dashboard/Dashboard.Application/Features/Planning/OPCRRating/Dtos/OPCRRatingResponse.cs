namespace ERPEZ.Application.Features.Planning.OPCRRating.Dtos;

public record OPCRRatingResponse
{
    public Guid Id { get; init; }
    public Guid OPCREvaluationId { get; init; }
    public Guid PerformanceMeasureId { get; init; }
    public Guid OPCRId { get; init; }
    public Guid DUKPITargetAssignmentId { get; init; }
    public int NumericalRating { get; init; }
    public string? Remarks { get; init; }
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
}

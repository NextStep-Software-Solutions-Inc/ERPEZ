using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Planning.OPCRActivityEvaluation.Dtos;

public record OPCRActivityEvaluationDetailedResponse
{
    public Guid Id { get; init; }
    public Guid OPCRActivityRatingId { get; init; }
    public Guid OPCRActivityId { get; init; }
    public string OPCRActivityName { get; init; } = string.Empty;
    public int SelfRatingScore { get; init; }
    public int EvaluatorScore { get; init; }
    public string? Remarks { get; init; }
    public DateTime? EvaluatedDate { get; init; }
    public OPCREvaluationStatus Status { get; init; }
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
}

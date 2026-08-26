namespace ERPEZ.Application.Features.Planning.OPCRActivityEvaluation.Dtos;

/// <summary>
/// Represents a single OPCR Activity Evaluation item for batch creation.
/// </summary>
public record CreateOPCRActivityEvaluationItemRequest
{
    public required Guid OPCRActivityRatingId { get; init; }
    public int EvaluatorScore { get; init; }
    public string? Remarks { get; init; }
}
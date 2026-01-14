using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Planning.OPCRActivityEvaluation.Dtos;

public record UpdateOPCRActivityEvaluationRequest
{
    public int? EvaluatorScore { get; init; }
    public string? Remarks { get; init; }
    public DateTime? EvaluatedDate { get; init; }
    public OPCREvaluationStatus? Status { get; init; }
}

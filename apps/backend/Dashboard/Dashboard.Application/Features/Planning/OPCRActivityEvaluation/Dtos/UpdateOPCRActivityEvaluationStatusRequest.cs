using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Planning.OPCRActivityEvaluation.Dtos;

/// <summary>
/// Request DTO for updating OPCR Activity Evaluation status.
/// </summary>
public record UpdateOPCRActivityEvaluationStatusRequest
{
    /// <summary>
    /// The new status for the evaluation as a string.
    /// Valid values: "Pending", "Evaluated", "Returned"
    /// </summary>
    public required string Status { get; init; }
}
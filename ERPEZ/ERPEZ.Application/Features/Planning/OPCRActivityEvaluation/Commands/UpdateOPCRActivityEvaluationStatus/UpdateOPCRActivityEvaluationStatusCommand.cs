using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivityEvaluation.Commands.UpdateOPCRActivityEvaluationStatus;

/// <summary>
/// Command to update the status of an OPCR Activity Evaluation with transition validation.
/// </summary>
public class UpdateOPCRActivityEvaluationStatusCommand : IRequest<ApiResponse<Unit>>
{
    /// <summary>
    /// The ID of the evaluation to update.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// The new status for the evaluation as a string.
    /// </summary>
    public required string StatusString { get; set; }
}
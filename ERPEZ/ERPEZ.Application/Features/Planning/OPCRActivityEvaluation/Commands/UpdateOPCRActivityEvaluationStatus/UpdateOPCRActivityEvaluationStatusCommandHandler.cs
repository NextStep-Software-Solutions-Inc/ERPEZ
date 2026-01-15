using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivityEvaluation.Commands.UpdateOPCRActivityEvaluationStatus;

/// <summary>
/// Handler for updating OPCR Activity Evaluation status with transition validation.
/// </summary>
public class UpdateOPCRActivityEvaluationStatusCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateOPCRActivityEvaluationStatusCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateOPCRActivityEvaluationStatusCommand request, CancellationToken cancellationToken)
    {
        var evaluation = await unitOfWork.OPCRActivityEvaluationRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("OPCR Activity Evaluation not found.");

        // Convert string to enum (validation already done in validator)
        var status = Enum.Parse<Domain.Enums.OPCREvaluationStatus>(request.StatusString, true);

        // Validate status transition
        if (!IsValidStatusTransition(evaluation.Status, status))
        {
            throw new ValidationException($"Invalid status transition from '{evaluation.Status}' to '{status}'. " +
                $"Allowed transitions are: {string.Join(", ", GetAllowedTransitions(evaluation.Status))}.");
        }

        // Update the status
        evaluation.Status = status;

        // Set EvaluatedDate when status changes to Evaluated
        if (status == Domain.Enums.OPCREvaluationStatus.Evaluated)
        {
            evaluation.EvaluatedDate = DateTime.UtcNow;
        }

        unitOfWork.OPCRActivityEvaluationRepository.Update(evaluation);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"OPCR Activity Evaluation status updated to {status} successfully.");
    }

    /// <summary>
    /// Validates if a status transition is allowed.
    /// </summary>
    private static bool IsValidStatusTransition(Domain.Enums.OPCREvaluationStatus currentStatus, Domain.Enums.OPCREvaluationStatus newStatus)
    {
        // No change is always allowed
        if (currentStatus == newStatus)
            return true;

        return (currentStatus, newStatus) switch
        {
            // From Pending: can go to Evaluated or Returned
            (Domain.Enums.OPCREvaluationStatus.Pending, Domain.Enums.OPCREvaluationStatus.Evaluated) => true,
            (Domain.Enums.OPCREvaluationStatus.Pending, Domain.Enums.OPCREvaluationStatus.Returned) => true,

            // From Evaluated: can only go to Returned (for revision)
            (Domain.Enums.OPCREvaluationStatus.Evaluated, Domain.Enums.OPCREvaluationStatus.Returned) => true,

            // From Returned: can go to Evaluated (revision complete) or Pending (reset)
            (Domain.Enums.OPCREvaluationStatus.Returned, Domain.Enums.OPCREvaluationStatus.Evaluated) => true,
            (Domain.Enums.OPCREvaluationStatus.Returned, Domain.Enums.OPCREvaluationStatus.Pending) => true,

            // All other transitions are invalid
            _ => false
        };
    }

    /// <summary>
    /// Gets the allowed status transitions for a given current status.
    /// </summary>
    private static List<string> GetAllowedTransitions(Domain.Enums.OPCREvaluationStatus currentStatus)
    {
        return currentStatus switch
        {
            Domain.Enums.OPCREvaluationStatus.Pending => [Domain.Enums.OPCREvaluationStatus.Evaluated.ToString(), Domain.Enums.OPCREvaluationStatus.Returned.ToString()],
            Domain.Enums.OPCREvaluationStatus.Evaluated => [Domain.Enums.OPCREvaluationStatus.Returned.ToString()],
            Domain.Enums.OPCREvaluationStatus.Returned => [Domain.Enums.OPCREvaluationStatus.Evaluated.ToString(), Domain.Enums.OPCREvaluationStatus.Pending.ToString()],
            _ => []
        };
    }
}
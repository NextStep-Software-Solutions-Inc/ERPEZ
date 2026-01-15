using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using FluentValidation;
using System.Collections.Generic;

namespace ERPEZ.Application.Features.Planning.OPCRActivityEvaluation.Commands.UpdateOPCRActivityEvaluationStatus;

/// <summary>
/// Validator for UpdateOPCRActivityEvaluationStatusCommand ensuring valid status transitions.
/// </summary>
public class UpdateOPCRActivityEvaluationStatusCommandValidator : AbstractValidator<UpdateOPCRActivityEvaluationStatusCommand>
{
    public UpdateOPCRActivityEvaluationStatusCommandValidator(IOPCRActivityEvaluationRepository evaluationRepository)
    {
        // ID validation
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Evaluation ID is required and must be a valid, non-empty GUID.");

        // Status string validation - must be parseable to valid enum value
        RuleFor(x => x.StatusString)
            .NotEmpty()
            .WithMessage("Status is required.")
            .Must(BeValidEnumValue)
            .WithMessage($"Status must be one of the following valid values: {string.Join(", ", Enum.GetNames<OPCREvaluationStatus>())} (case insensitive).");

        // Status transition validation with detailed error messages
        RuleFor(x => x)
            .MustAsync(async (command, cancellation) =>
            {
                if (!Enum.TryParse<OPCREvaluationStatus>(command.StatusString, true, out var newStatus))
                    return false; // Invalid enum value already caught above

                var evaluation = await evaluationRepository.GetByIdAsync(command.Id);
                if (evaluation == null)
                    return true; // Let the handler handle the not found case

                return IsValidStatusTransition(evaluation.Status, newStatus);
            })
            .WithMessage("Invalid status transition. " +
                         "Allowed transitions are: " +
                         $"{string.Join("; ", Enum.GetValues<OPCREvaluationStatus>().Cast<OPCREvaluationStatus>().Select(s => $"{s} -> [{string.Join(", ", GetAllowedTransitions(s))}]"))}.")
            .When(x => x.Id != Guid.Empty && !string.IsNullOrWhiteSpace(x.StatusString));
    }

    private static bool BeValidEnumValue(string statusString)
    {
        return Enum.TryParse<OPCREvaluationStatus>(statusString, true, out _);
    }

    /// <summary>
    /// Validates if a status transition is allowed.
    /// </summary>
    private static bool IsValidStatusTransition(OPCREvaluationStatus currentStatus, OPCREvaluationStatus newStatus)
    {
        // No change is always allowed
        if (currentStatus == newStatus)
            return true;

        return (currentStatus, newStatus) switch
        {
            // From Pending: can go to Evaluated or Returned
            (OPCREvaluationStatus.Pending, OPCREvaluationStatus.Evaluated) => true,
            (OPCREvaluationStatus.Pending, OPCREvaluationStatus.Returned) => true,

            // From Evaluated: can only go to Returned (for revision)
            (OPCREvaluationStatus.Evaluated, OPCREvaluationStatus.Returned) => true,

            // From Returned: can go to Evaluated (revision complete) or Pending (reset)
            (OPCREvaluationStatus.Returned, OPCREvaluationStatus.Evaluated) => true,
            (OPCREvaluationStatus.Returned, OPCREvaluationStatus.Pending) => true,

            // All other transitions are invalid
            _ => false
        };
    }

    private static List<string> GetAllowedTransitions(OPCREvaluationStatus currentStatus)
    {
        var allStatuses = Enum.GetNames<OPCREvaluationStatus>();

        return currentStatus switch
        {
            OPCREvaluationStatus.Pending => [OPCREvaluationStatus.Evaluated.ToString(), OPCREvaluationStatus.Returned.ToString()],
            OPCREvaluationStatus.Evaluated => [OPCREvaluationStatus.Returned.ToString()],
            OPCREvaluationStatus.Returned => [OPCREvaluationStatus.Evaluated.ToString(), OPCREvaluationStatus.Pending.ToString()],
            _ => []
        };
    }

    private static string GetTransitionErrorMessage(UpdateOPCRActivityEvaluationStatusCommand command, IOPCRActivityEvaluationRepository evaluationRepository)
    {
        // This is a simplified version since we can't easily await in WithMessage
        // The actual validation logic will handle the detailed message
        return "Invalid status transition. Please check the allowed transitions for the current evaluation status.";
    }
}
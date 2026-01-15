using ERPEZ.Domain.Enums;
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.OPCRActivityEvaluation.Commands.UpdateOPCRActivityEvaluationStatus;

/// <summary>
/// Validator for UpdateOPCRActivityEvaluationStatusCommand ensuring valid status transitions.
/// </summary>
public class UpdateOPCRActivityEvaluationStatusCommandValidator : AbstractValidator<UpdateOPCRActivityEvaluationStatusCommand>
{
    private readonly string[] validStatuses = Enum.GetNames<OPCREvaluationStatus>();

    public UpdateOPCRActivityEvaluationStatusCommandValidator()
    {
        // ID validation
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Evaluation ID is required and must be a valid, non-empty GUID.");

        // Status string validation - must be parseable to valid enum value
        RuleFor(x => x.StatusString)
            .NotEmpty()
            .WithMessage("Status is required.")
            .Must(status => validStatuses.Contains(status, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Status must be one of the following valid values: {string.Join(", ", validStatuses)} (case insensitive).");
    }
}
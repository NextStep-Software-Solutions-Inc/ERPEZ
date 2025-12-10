using FluentValidation;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTarget.Commands.DeleteWFPObjectiveTarget;

/// <summary>
/// Validator for DeleteWFPObjectiveTargetCommand ensuring all user input meets business requirements.
/// </summary>
public class DeleteWFPObjectiveTargetCommandValidator : AbstractValidator<DeleteWFPObjectiveTargetCommand>
{
    public DeleteWFPObjectiveTargetCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Activity ID is required for deletion.")
            .Must(id => id != Guid.Empty)
            .WithMessage("Activity ID must be a valid, non-empty GUID.");
    }
}

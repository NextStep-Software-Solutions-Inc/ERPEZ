using FluentValidation;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveActivity.Commands.DeleteWFPObjectiveActivity;

/// <summary>
/// Validator for DeleteWFPObjectiveActivityCommand ensuring all user input meets business requirements.
/// </summary>
public class DeleteWFPObjectiveActivityCommandValidator : AbstractValidator<DeleteWFPObjectiveActivityCommand>
{
    public DeleteWFPObjectiveActivityCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Activity ID is required for deletion.")
            .Must(id => id != Guid.Empty)
            .WithMessage("Activity ID must be a valid, non-empty GUID.");
    }
}

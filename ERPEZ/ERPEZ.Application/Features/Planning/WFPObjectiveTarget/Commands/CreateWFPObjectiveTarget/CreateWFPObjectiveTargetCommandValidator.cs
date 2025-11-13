using FluentValidation;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTarget.Commands.CreateWFPObjectiveTarget;

public class CreateWFPObjectiveTargetCommandValidator : AbstractValidator<CreateWFPObjectiveTargetCommand>
{
    public CreateWFPObjectiveTargetCommandValidator()
    {
        RuleFor(x => x.WFPObjectiveId)
            .NotEmpty()
            .WithMessage("WFP Objective ID is required.");

        RuleFor(x => x.ActivityName)
            .NotEmpty()
            .WithMessage("Activity Name is required.")
            .MaximumLength(256)
            .WithMessage("Activity Name cannot exceed 256 characters.");

        RuleFor(x => x.Indicator)
            .NotEmpty()
            .WithMessage("Indicator is required.")
            .MaximumLength(500)
            .WithMessage("Indicator cannot exceed 500 characters.");

        RuleFor(x => x.Weight)
            .GreaterThan(0)
            .WithMessage("Weight must be greater than zero.")
            .LessThanOrEqualTo(100)
            .WithMessage("Weight cannot exceed 100.");
    }
}

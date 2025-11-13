using FluentValidation;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTarget.Commands.UpdateWFPObjectiveTarget;

public class UpdateWFPObjectiveTargetCommandValidator : AbstractValidator<UpdateWFPObjectiveTargetCommand>
{
    public UpdateWFPObjectiveTargetCommandValidator()
    {
        // ID (Required GUID for the update command)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Objective Target ID is required for updating the record.");

        // ActivityName (Optional String, Max Length 256)
        RuleFor(x => x.UpdateWFPObjectiveTarget.ActivityName)
            .MaximumLength(256)
            .WithMessage("Activity Name cannot exceed 256 characters.");

        // Indicator (Optional String, Max Length 500)
        RuleFor(x => x.UpdateWFPObjectiveTarget.Indicator)
            .MaximumLength(500)
            .WithMessage("Indicator cannot exceed 500 characters.");

        // Weight (Optional Decimal, Must be positive if provided)
        RuleFor(x => x.UpdateWFPObjectiveTarget.Weight)
            .Must(weight => weight.HasValue)
            .When(x => x.UpdateWFPObjectiveTarget.Weight.HasValue)
            .WithMessage("Weight is required if provided in the request body.")
            .GreaterThan(0)
            .WithMessage("Weight must be greater than zero.")
            .LessThanOrEqualTo(100)
            .WithMessage("Weight cannot exceed 100.");
    }
}

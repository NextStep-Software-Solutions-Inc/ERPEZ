using FluentValidation;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTarget.Commands.UpdateWFPObjectiveTarget;

/// <summary>
/// Validator for UpdateWFPObjectiveTargetCommand ensuring all user input meets business requirements.
/// </summary>
public class UpdateWFPObjectiveTargetCommandValidator : AbstractValidator<UpdateWFPObjectiveTargetCommand>
{
    public UpdateWFPObjectiveTargetCommandValidator()
    {
        // Primary ID Validation (Crucial for updates)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Activity ID is required for update.")
            .Must(id => id != Guid.Empty)
            .WithMessage("Activity ID must be a valid, non-empty GUID.");

        // ActivityName (Optional String, Min/Max Length)
        RuleFor(x => x.UpdateWFPObjectiveTarget.ActivityName)
            .MinimumLength(3)
            .WithMessage("Activity Name must be at least 3 characters long.")
            .MaximumLength(500)
            .WithMessage("Activity Name cannot exceed 500 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.UpdateWFPObjectiveTarget.ActivityName));

        // Indicator (Optional String, Min/Max Length)
        RuleFor(x => x.UpdateWFPObjectiveTarget.Indicator)
            .MinimumLength(3)
            .WithMessage("Indicator must be at least 3 characters long.")
            .MaximumLength(500)
            .WithMessage("Indicator cannot exceed 500 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.UpdateWFPObjectiveTarget.Indicator));

        // Weight (Optional, Must be between 0 and 100)
        RuleFor(x => x.UpdateWFPObjectiveTarget.Weight)
            .InclusiveBetween(0.01m, 100m)
            .WithMessage("Weight must be between 0.01% and 100%.")
            .When(x => x.UpdateWFPObjectiveTarget.Weight.HasValue);
    }
}

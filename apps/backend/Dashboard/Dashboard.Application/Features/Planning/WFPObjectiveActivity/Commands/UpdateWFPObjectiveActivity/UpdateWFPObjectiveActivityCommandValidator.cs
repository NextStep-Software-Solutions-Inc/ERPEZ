using FluentValidation;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveActivity.Commands.UpdateWFPObjectiveActivity;

/// <summary>
/// Validator for UpdateWFPObjectiveActivityCommand ensuring all user input meets business requirements.
/// </summary>
public class UpdateWFPObjectiveActivityCommandValidator : AbstractValidator<UpdateWFPObjectiveActivityCommand>
{
    public UpdateWFPObjectiveActivityCommandValidator()
    {
        // Primary ID Validation (Crucial for updates)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Activity ID is required for update.")
            .Must(id => id != Guid.Empty)
            .WithMessage("Activity ID must be a valid, non-empty GUID.");

        // ActivityName (Optional String, Min/Max Length)
        RuleFor(x => x.UpdateWFPObjectiveActivity.ActivityName)
            .MinimumLength(3)
            .WithMessage("Activity Name must be at least 3 characters long.")
            .MaximumLength(500)
            .WithMessage("Activity Name cannot exceed 500 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.UpdateWFPObjectiveActivity.ActivityName));

        // Indicator (Optional String, Min/Max Length)
        RuleFor(x => x.UpdateWFPObjectiveActivity.Indicator)
            .MinimumLength(3)
            .WithMessage("Indicator must be at least 3 characters long.")
            .MaximumLength(500)
            .WithMessage("Indicator cannot exceed 500 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.UpdateWFPObjectiveActivity.Indicator));

        // Weight (Optional, Must be between 0 and 100)
        RuleFor(x => x.UpdateWFPObjectiveActivity.Weight)
            .InclusiveBetween(0.01m, 100m)
            .WithMessage("Weight must be between 0.01% and 100%.")
            .When(x => x.UpdateWFPObjectiveActivity.Weight.HasValue);
    }
}

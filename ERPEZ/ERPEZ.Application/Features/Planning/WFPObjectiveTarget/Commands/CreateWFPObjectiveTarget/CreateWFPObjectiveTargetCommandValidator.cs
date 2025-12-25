using FluentValidation;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTarget.Commands.CreateWFPObjectiveTarget;

/// <summary>
/// Validator for CreateWFPObjectiveTargetCommand ensuring all user input meets business requirements.
/// </summary>
public class CreateWFPObjectiveTargetCommandValidator : AbstractValidator<CreateWFPObjectiveTargetCommand>
{
    public CreateWFPObjectiveTargetCommandValidator()
    {
        // WFPObjectiveId (Required GUID)
        RuleFor(x => x.WFPObjectiveId)
            .NotEmpty()
            .WithMessage("Work and Financial Plan Objective ID is required.")
            .Must(id => id != Guid.Empty)
            .WithMessage("Work and Financial Plan Objective ID must be a valid, non-empty GUID.");

        // ActivityName (Required String, Min/Max Length)
        RuleFor(x => x.ActivityName)
            .NotEmpty()
            .WithMessage("Activity Name is required.")
            .MinimumLength(3)
            .WithMessage("Activity Name must be at least 3 characters long.")
            .MaximumLength(500)
            .WithMessage("Activity Name cannot exceed 500 characters.");

        // Indicator (Required String, Min/Max Length)
        RuleFor(x => x.Indicator)
            .NotEmpty()
            .WithMessage("Indicator is required.")
            .MinimumLength(3)
            .WithMessage("Indicator must be at least 3 characters long.")
            .MaximumLength(500)
            .WithMessage("Indicator cannot exceed 500 characters.");

        // Weight (Required, Must be between 0 and 100)
        RuleFor(x => x.Weight)
            .InclusiveBetween(0.01m, 100m)
            .WithMessage("Weight must be between 0.01% and 100%.");

        // TargetAccomplishment (Optional, Max Length when provided)
        RuleFor(x => x.TargetAccomplishment)
            .MaximumLength(1000)
            .WithMessage("Target Accomplishment cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.TargetAccomplishment));

        // TimelineType (Optional, Max Length when provided)
        RuleFor(x => x.TimelineType)
            .MaximumLength(50)
            .WithMessage("Timeline Type cannot exceed 50 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.TimelineType));

        // Dates (Optional array, but when provided, each date range must be valid)
        RuleForEach(x => x.Dates)
            .ChildRules(dateRange =>
            {
                dateRange.RuleFor(d => d.StartDate)
                    .NotEmpty()
                    .WithMessage("Start Date is required for each date range.");

                dateRange.RuleFor(d => d.EndDate)
                    .NotEmpty()
                    .WithMessage("End Date is required for each date range.")
                    .GreaterThan(d => d.StartDate)
                    .WithMessage("End Date must be after Start Date.");
            });
    }
}

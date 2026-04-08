using FluentValidation;
using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveActivity.Commands.CreateWFPObjectiveActivity;

/// <summary>
/// Validator for CreateWFPObjectiveActivityCommand ensuring all user input meets business requirements.
/// </summary>
public class CreateWFPObjectiveActivityCommandValidator : AbstractValidator<CreateWFPObjectiveActivityCommand>
{
    public CreateWFPObjectiveActivityCommandValidator()
    {
        // WFPId (Always required)
        RuleFor(x => x.WFPId)
            .NotEmpty()
            .WithMessage("WFP ID is required.")
            .Must(id => id != Guid.Empty)
            .WithMessage("WFP ID must be a valid, non-empty GUID.");

        // WFPObjectiveId (Required for External path when OPCRActivityId is not provided)
        RuleFor(x => x.WFPObjectiveId)
            .NotEmpty()
            .WithMessage("WFP Objective ID is required when no OPCR Activity ID is provided.")
            .Must(id => id != Guid.Empty)
            .WithMessage("WFP Objective ID must be a valid, non-empty GUID.")
            .When(x => !x.OPCRActivityId.HasValue);

        // ActivityName (Required only on External path; auto-filled from OPCRActivity on OPCR path)
        RuleFor(x => x.ActivityName)
            .NotEmpty()
            .WithMessage("Activity Name is required.")
            .MinimumLength(3)
            .WithMessage("Activity Name must be at least 3 characters long.")
            .MaximumLength(500)
            .WithMessage("Activity Name cannot exceed 500 characters.")
            .When(x => !x.OPCRActivityId.HasValue);
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
                    .GreaterThanOrEqualTo(d => d.StartDate)
                    .WithMessage("End Date must be on or after Start Date.");

                dateRange.RuleFor(d => d.Value)
                    .GreaterThan(0)
                    .WithMessage("Value must be greater than 0 for each date range.");

                dateRange.RuleFor(d => d.TimelineType)
                    .NotEmpty()
                    .WithMessage("Timeline Type is required for each date range.")
                    .Must(BeValidTimelineType)
                    .WithMessage(GetValidTimelineTypesMessage());
            });
    }

    private static bool BeValidTimelineType(string timelineType)
    {
        return Enum.TryParse<TimelineTypeEnum>(timelineType, ignoreCase: true, out _);
    }

    private static string GetValidTimelineTypesMessage()
    {
        var validValues = string.Join(", ", Enum.GetNames(typeof(TimelineTypeEnum)));
        return $"Timeline Type must be a valid value: {validValues}.";
    }
}

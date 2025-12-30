using FluentValidation;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Commands.CreateWFPObjectiveTimeline;
using ERPEZ.Domain.Enums;

/// <summary>
/// Validator for CreateWFPObjectiveTimelineCommand ensuring all user input meets business requirements.
/// </summary>
public class CreateWFPObjectiveTimelineCommandValidator : AbstractValidator<CreateWFPObjectiveTimelineCommand>
{
    public CreateWFPObjectiveTimelineCommandValidator()
    {
        // WFPObjectiveTargetId (Required GUID)
        RuleFor(x => x.WFPObjectiveTargetId)
            .NotEmpty()
            .WithMessage("Activity ID is required.")
            .Must(id => id != Guid.Empty)
            .WithMessage("Activity ID must be a valid, non-empty GUID.");

        // TimelineType (Required string, must be valid enum value)
        RuleFor(x => x.TimelineType)
            .NotEmpty()
            .WithMessage("Timeline Type is required.")
            .Must(BeValidTimelineType)
            .WithMessage(GetValidTimelineTypesMessage());

        // StartDate (Required)
        RuleFor(x => x.StartDate)
            .NotEmpty()
            .WithMessage("Start Date is required.");

        // EndDate (Required, must be after StartDate)
        RuleFor(x => x.EndDate)
            .NotEmpty()
            .WithMessage("End Date is required.")
            .GreaterThan(x => x.StartDate)
            .WithMessage("End Date must be after Start Date.");

        // TargetValue (Required, must be positive)
        RuleFor(x => x.TargetValue)
            .GreaterThan(0)
            .WithMessage("Target Value must be greater than zero.");
    }

    private bool BeValidTimelineType(string timelineType)
    {
        return Enum.TryParse<TimelineTypeEnum>(timelineType, ignoreCase: true, out _);
    }

    private static string GetValidTimelineTypesMessage()
    {
        var validValues = string.Join(", ", Enum.GetNames(typeof(TimelineTypeEnum)));
        return $"Timeline Type must be a valid value: {validValues}.";
    }
}

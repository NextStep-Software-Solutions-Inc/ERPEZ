using FluentValidation;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Commands.UpdateWFPObjectiveTimeline;
using ERPEZ.Domain.Enums;

/// <summary>
/// Validator for UpdateWFPObjectiveTimelineCommand ensuring all user input meets business requirements.
/// </summary>
public class UpdateWFPObjectiveTimelineCommandValidator : AbstractValidator<UpdateWFPObjectiveTimelineCommand>
{
    public UpdateWFPObjectiveTimelineCommandValidator()
    {
        // Primary ID Validation (Crucial for updates)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Timeline ID is required for update.")
            .Must(id => id != Guid.Empty)
            .WithMessage("Timeline ID must be a valid, non-empty GUID.");

        // TimelineType (Optional string, must be valid enum value when provided)
        RuleFor(x => x.UpdateWFPObjectiveTimeline.TimelineType)
            .Must(BeValidTimelineType)
            .WithMessage(GetValidTimelineTypesMessage())
            .When(x => !string.IsNullOrWhiteSpace(x.UpdateWFPObjectiveTimeline.TimelineType));

        // EndDate must be after StartDate when both are provided
        RuleFor(x => x.UpdateWFPObjectiveTimeline.EndDate)
            .GreaterThan(x => x.UpdateWFPObjectiveTimeline.StartDate!.Value)
            .WithMessage("End Date must be after Start Date.")
            .When(x => x.UpdateWFPObjectiveTimeline.StartDate.HasValue && x.UpdateWFPObjectiveTimeline.EndDate.HasValue);

        // TargetValue (Optional, must be positive when provided)
        RuleFor(x => x.UpdateWFPObjectiveTimeline.TargetValue)
            .GreaterThan(0)
            .WithMessage("Target Value must be greater than zero.")
            .When(x => x.UpdateWFPObjectiveTimeline.TargetValue.HasValue);
    }

    private bool BeValidTimelineType(string? timelineType)
    {
        if (string.IsNullOrWhiteSpace(timelineType))
            return true;

        return System.Enum.TryParse<TimelineTypeEnum>(timelineType, ignoreCase: true, out _);
    }

    private static string GetValidTimelineTypesMessage()
    {
        var validValues = string.Join(", ", System.Enum.GetNames(typeof(TimelineTypeEnum)));
        return $"Timeline Type must be a valid value: {validValues}.";
    }
}

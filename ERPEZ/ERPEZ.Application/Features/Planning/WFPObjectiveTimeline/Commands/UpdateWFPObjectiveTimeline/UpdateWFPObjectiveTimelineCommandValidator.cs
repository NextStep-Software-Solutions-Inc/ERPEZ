using FluentValidation;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Commands.UpdateWFPObjectiveTimeline;

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
}

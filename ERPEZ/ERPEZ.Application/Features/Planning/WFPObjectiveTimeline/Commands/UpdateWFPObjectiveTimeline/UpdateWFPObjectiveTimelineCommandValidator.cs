using FluentValidation;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Commands.UpdateWFPObjectiveTimeline;

public class UpdateWFPObjectiveTimelineCommandValidator : AbstractValidator<UpdateWFPObjectiveTimelineCommand>
{
    public UpdateWFPObjectiveTimelineCommandValidator()
    {
        // ID (Required GUID for the update command)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Objective Timeline ID is required for updating the record.");

        // StartDate (Optional Date)
        RuleFor(x => x.UpdateWFPObjectiveTimeline.StartDate)
            .NotEmpty()
            .When(x => x.UpdateWFPObjectiveTimeline.StartDate.HasValue)
            .WithMessage("Start Date cannot be empty if provided.");

        // EndDate (Optional Date)
        RuleFor(x => x.UpdateWFPObjectiveTimeline.EndDate)
            .NotEmpty()
            .When(x => x.UpdateWFPObjectiveTimeline.EndDate.HasValue)
            .WithMessage("End Date cannot be empty if provided.");

        // TargetValue (Optional Decimal, must be positive if provided)
        RuleFor(x => x.UpdateWFPObjectiveTimeline.TargetValue)
            .GreaterThan(0)
            .When(x => x.UpdateWFPObjectiveTimeline.TargetValue.HasValue)
            .WithMessage("Target Value must be greater than zero if provided.");

        // --- Cross-Property Validation (Only runs if BOTH StartDate and EndDate are provided) ---
        RuleFor(x => x.UpdateWFPObjectiveTimeline.EndDate)
            .Must((command, endDate) => endDate!.Value >= command.UpdateWFPObjectiveTimeline.StartDate!.Value)
                .When(x => x.UpdateWFPObjectiveTimeline.StartDate.HasValue && x.UpdateWFPObjectiveTimeline.EndDate.HasValue)
                .WithMessage("End Date must be on or after the Start Date.");
    }
}

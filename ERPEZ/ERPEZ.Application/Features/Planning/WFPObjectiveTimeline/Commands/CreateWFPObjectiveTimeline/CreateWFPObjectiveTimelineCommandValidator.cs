using FluentValidation;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Commands.CreateWFPObjectiveTimeline;

public class CreateWFPObjectiveTimelineCommandValidator : AbstractValidator<CreateWFPObjectiveTimelineCommand>
{
    public CreateWFPObjectiveTimelineCommandValidator()
    {
        RuleFor(x => x.WFPObjectiveTargetId)
            .NotEmpty()
            .WithMessage("WFP Objective Target ID is required.");

        RuleFor(x => x.StartDate)
            .NotEmpty()
            .WithMessage("Start Date is required.");

        RuleFor(x => x.EndDate)
            .NotEmpty()
            .WithMessage("End Date is required.")
            .GreaterThanOrEqualTo(x => x.StartDate)
            .WithMessage("End Date must be on or after the Start Date.");

        RuleFor(x => x.TargetValue)
            .GreaterThan(0)
            .WithMessage("Target Value must be greater than zero.");
    }
}

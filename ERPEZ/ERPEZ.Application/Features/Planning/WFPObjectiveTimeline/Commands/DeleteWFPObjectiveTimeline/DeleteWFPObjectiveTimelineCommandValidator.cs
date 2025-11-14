using ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Commands.CreateWFPObjectiveTimeline;
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Commands.DeleteWFPObjectiveTimeline;

public class DeleteWFPObjectiveTimelineCommandValidator : AbstractValidator<DeleteWFPObjectiveTimelineCommand>
{
    public DeleteWFPObjectiveTimelineCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Id is required.");
    }
}

using FluentValidation;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTimeline.Commands.DeleteWFPObjectiveTimeline;

/// <summary>
/// Validator for DeleteWFPObjectiveTimelineCommand ensuring all user input meets business requirements.
/// </summary>
public class DeleteWFPObjectiveTimelineCommandValidator : AbstractValidator<DeleteWFPObjectiveTimelineCommand>
{
    public DeleteWFPObjectiveTimelineCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Timeline ID is required for deletion.")
            .Must(id => id != Guid.Empty)
            .WithMessage("Timeline ID must be a valid, non-empty GUID.");
    }
}

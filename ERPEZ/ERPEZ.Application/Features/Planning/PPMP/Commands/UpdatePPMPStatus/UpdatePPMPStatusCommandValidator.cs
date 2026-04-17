using FluentValidation;

namespace ERPEZ.Application.Features.Planning.PPMP.Commands.UpdatePPMPStatus;

public class UpdatePPMPStatusCommandValidator : AbstractValidator<UpdatePPMPStatusCommand>
{
    public UpdatePPMPStatusCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("PPMP ID is required.");

        RuleFor(x => x.Action)
            .NotEmpty()
            .Must(x =>
            {
                var action = x.Trim().ToLowerInvariant();
                return action is "submit" or "approve" or "reject";
            })
            .WithMessage("Action must be submit, approve, or reject.");

        RuleFor(x => x.Role)
            .NotEmpty()
            .When(x =>
            {
                var action = x.Action.Trim().ToLowerInvariant();
                return action is "approve" or "reject";
            })
            .WithMessage("Role is required for approve or reject actions.");

        RuleFor(x => x.Notes)
            .NotEmpty()
            .When(x => x.Action.Trim().ToLowerInvariant() == "reject")
            .WithMessage("Notes are required for reject action.");
    }
}
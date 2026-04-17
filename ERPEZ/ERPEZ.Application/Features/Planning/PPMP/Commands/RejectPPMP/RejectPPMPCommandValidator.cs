using FluentValidation;

namespace ERPEZ.Application.Features.Planning.PPMP.Commands.RejectPPMP;

public class RejectPPMPCommandValidator : AbstractValidator<RejectPPMPCommand>
{
    public RejectPPMPCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("PPMP ID is required.");

        RuleFor(x => x.RejectedBy)
            .NotEmpty()
            .WithMessage("RejectedBy is required.");

        RuleFor(x => x.Role)
            .NotEmpty()
            .WithMessage("Role is required.")
            .MaximumLength(100)
            .WithMessage("Role cannot exceed 100 characters.");

        RuleFor(x => x.Reason)
            .NotEmpty()
            .WithMessage("Reason is required.")
            .MaximumLength(500)
            .WithMessage("Reason cannot exceed 500 characters.");
    }
}

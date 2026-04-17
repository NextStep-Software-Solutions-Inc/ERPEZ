using FluentValidation;

namespace ERPEZ.Application.Features.Planning.PPMP.Commands.SubmitPPMPForApproval;

public class SubmitPPMPForApprovalCommandValidator : AbstractValidator<SubmitPPMPForApprovalCommand>
{
    public SubmitPPMPForApprovalCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("PPMP ID is required.");

        RuleFor(x => x.SubmittedBy)
            .NotEmpty()
            .WithMessage("SubmittedBy is required.");
    }
}

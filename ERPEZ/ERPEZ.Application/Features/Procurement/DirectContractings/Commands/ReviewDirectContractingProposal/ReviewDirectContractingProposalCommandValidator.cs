using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.DirectContractings.Commands.ReviewDirectContractingProposal;

public class ReviewDirectContractingProposalCommandValidator : AbstractValidator<ReviewDirectContractingProposalCommand>
{
    public ReviewDirectContractingProposalCommandValidator()
    {
        RuleFor(x => x.DirectContractingId)
            .NotEmpty().WithMessage("Direct Contracting ID is required.");

        RuleFor(x => x.Action)
            .NotEmpty().WithMessage("Review Action is required.")
            .Must(a => a == "APPROVED" || a == "RETURNED")
            .WithMessage("Review Action must be either 'APPROVED' or 'RETURNED'.");
    }
}

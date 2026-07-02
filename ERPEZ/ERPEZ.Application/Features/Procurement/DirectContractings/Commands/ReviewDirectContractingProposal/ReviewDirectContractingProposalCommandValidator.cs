using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.DirectContractings.Commands.ReviewDirectContractingProposal;

public class ReviewDirectContractingProposalCommandValidator : AbstractValidator<ReviewDirectContractingProposalCommand>
{
    public ReviewDirectContractingProposalCommandValidator()
    {
        RuleFor(x => x.DirectContractingId)
            .NotEmpty().WithMessage("Direct Contracting ID is required.");

        RuleFor(x => x.Action)
            .IsInEnum().WithMessage("Review Action must be either 'Approved' or 'Returned'.");
    }
}

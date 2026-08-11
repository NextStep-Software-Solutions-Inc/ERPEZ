using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.DirectContractings.Commands.SubmitDirectContractingProposal;

public class SubmitDirectContractingProposalCommandValidator : AbstractValidator<SubmitDirectContractingProposalCommand>
{
    public SubmitDirectContractingProposalCommandValidator()
    {
        RuleFor(x => x.DirectContractingId)
            .NotEmpty().WithMessage("Direct Contracting ID is required.");

        RuleFor(x => x.Request.SupplierId)
            .NotEmpty().WithMessage("Supplier ID is required.");

        // Mandatory Exclusivity Document requirement
        RuleFor(x => x.Request.ExclusivityDocumentUrl)
            .NotEmpty().WithMessage("Mandatory Exclusivity Justification document is required for Direct Contracting.");

        RuleFor(x => x.Request.ProposalItems)
            .NotEmpty().WithMessage("At least one proposal item must be submitted.");

        RuleForEach(x => x.Request.ProposalItems).ChildRules(item =>
        {
            item.RuleFor(i => i.CPRItemId)
                .NotEmpty().WithMessage("CPR Item ID is required.");

            item.RuleFor(i => i.UnitBid)
                .GreaterThan(0).WithMessage("Unit bid price must be greater than zero.");
        });
    }
}

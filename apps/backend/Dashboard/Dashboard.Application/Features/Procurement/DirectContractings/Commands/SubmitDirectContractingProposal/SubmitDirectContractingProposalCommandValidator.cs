using System;
using System.Linq;
using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.DirectContractings.Commands.SubmitDirectContractingProposal;

public class SubmitDirectContractingProposalCommandValidator : AbstractValidator<SubmitDirectContractingProposalCommand>
{
    public SubmitDirectContractingProposalCommandValidator()
    {
        RuleFor(x => x.DirectContractingId)
            .NotEmpty().WithMessage("Direct Contracting ID is required.");

        // Mandatory Exclusivity Document requirement (supports either ExclusivityDocumentUrl or ExclusivityProofUrl)
        RuleFor(x => x.Request)
            .Must(r => !string.IsNullOrWhiteSpace(r.ExclusivityDocumentUrl) || !string.IsNullOrWhiteSpace(r.ExclusivityProofUrl))
            .WithMessage("Mandatory Exclusivity Justification document is required for Direct Contracting.");

        RuleFor(x => x.Request)
            .Must(r => (r.ProposalItems != null && r.ProposalItems.Count > 0) || (r.QuotationItems != null && r.QuotationItems.Count > 0))
            .WithMessage("At least one proposal item must be submitted.");

        RuleFor(x => x.Request)
            .Must(r =>
            {
                var items = (r.ProposalItems != null && r.ProposalItems.Count > 0)
                    ? r.ProposalItems
                    : (r.QuotationItems ?? []);
                return items.All(i => (i.CPRItemId != Guid.Empty || (i.PrItemId.HasValue && i.PrItemId.Value != Guid.Empty))
                                      && (i.UnitBid > 0 || (i.BidUnitPrice.HasValue && i.BidUnitPrice.Value > 0)));
            })
            .WithMessage("Every submitted proposal item must have a valid Item ID and a unit bid price greater than zero.");
    }
}


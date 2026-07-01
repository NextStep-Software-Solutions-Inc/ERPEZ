using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Commands.ConsolidatedPR.RemovePRFromConsolidated;

public class RemovePRFromConsolidatedCommandValidator
    : AbstractValidator<RemovePRFromConsolidatedCommand>
{
    public RemovePRFromConsolidatedCommandValidator()
    {
        RuleFor(x => x.ConsolidatedPRId)
            .NotEmpty().WithMessage("Consolidated PR ID is required.");

        RuleFor(x => x.PurchaseRequestId)
            .NotEmpty().WithMessage("Purchase Request ID is required.");
    }
}
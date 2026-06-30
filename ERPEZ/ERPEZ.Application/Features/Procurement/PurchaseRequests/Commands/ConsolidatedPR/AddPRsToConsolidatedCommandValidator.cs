using ERPEZ.Application.Features.Procurement.PurchaseRequests.Dtos;
using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Commands.ConsolidatedPR;

public class AddPRsToConsolidatedCommandValidator : AbstractValidator<AddPRsToConsolidatedCommand>
{
    public AddPRsToConsolidatedCommandValidator()
    {
        RuleFor(x => x.Dto.ConsolidatedPRId)
            .NotEmpty().WithMessage("Consolidated PR ID is required.");

        RuleFor(x => x.Dto.PurchaseRequestIds)          // ← was PRItemIds
            .NotEmpty().WithMessage("At least one Purchase Request must be selected.");

        RuleForEach(x => x.Dto.PurchaseRequestIds)      // ← was PRItemIds
            .NotEmpty().WithMessage("Purchase Request ID must not be empty.");
    }
}
using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Commands.ConsolidatedPR;

public class ReturnConsolidatedPRCommandValidator : AbstractValidator<ReturnConsolidatedPRCommand>
{
    public ReturnConsolidatedPRCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Consolidated PR ID is required.");
    }
}
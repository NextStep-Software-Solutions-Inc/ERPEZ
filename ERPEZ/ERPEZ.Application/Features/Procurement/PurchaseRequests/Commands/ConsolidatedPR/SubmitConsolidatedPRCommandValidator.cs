using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Commands.ConsolidatedPR;

public class SubmitConsolidatedPRCommandValidator : AbstractValidator<SubmitConsolidatedPRCommand>
{
    public SubmitConsolidatedPRCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Consolidated PR ID is required.");
    }
}
using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Commands.ConsolidatedPR;

public class ApproveConsolidatedPRCommandValidator : AbstractValidator<ApproveConsolidatedPRCommand>
{
    public ApproveConsolidatedPRCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Consolidated PR ID is required.");
    }
}
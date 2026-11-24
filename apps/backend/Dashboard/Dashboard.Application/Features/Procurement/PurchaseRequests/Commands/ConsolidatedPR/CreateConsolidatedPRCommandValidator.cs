using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Commands.ConsolidatedPR;

public class CreateConsolidatedPRCommandValidator : AbstractValidator<CreateConsolidatedPRCommand>
{
    public CreateConsolidatedPRCommandValidator()
    {
        RuleFor(x => x.Dto.ConsolidationDate)
            .NotEmpty().WithMessage("Consolidation date is required.");

        RuleFor(x => x.Dto.Description)
            .MaximumLength(500).WithMessage("Description cannot exceed 500 characters.")
            .When(x => x.Dto.Description is not null);

        RuleFor(x => x.Dto.Purpose)
            .MaximumLength(1000).WithMessage("Purpose cannot exceed 1000 characters.")
            .When(x => x.Dto.Purpose is not null);
    }
}
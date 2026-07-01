using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Commands.ConsolidatedPR;

public class UpdateConsolidatedPRItemCommandValidator : AbstractValidator<UpdateConsolidatedPRItemCommand>
{
    public UpdateConsolidatedPRItemCommandValidator()
    {
        RuleFor(x => x.Dto.ConsolidatedPRItemId)
            .NotEmpty().WithMessage("Consolidated PR Item ID is required.");

        RuleFor(x => x.Dto.ProcurementModeId)
            .Must(id => !id.HasValue || id.Value != Guid.Empty)
            .WithMessage("Procurement Mode ID must be a valid non-empty GUID.")
            .When(x => x.Dto.ProcurementModeId.HasValue);
    }
}
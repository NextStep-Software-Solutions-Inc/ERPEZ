using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Commands.DeletePR;

public class DeletePRCommandValidator : AbstractValidator<DeletePRCommand>
{
    public DeletePRCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("PR ID is required.");
    }
}
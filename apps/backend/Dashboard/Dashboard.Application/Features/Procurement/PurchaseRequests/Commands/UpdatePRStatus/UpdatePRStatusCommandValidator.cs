using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Commands.UpdatePRStatus;

public class UpdatePRStatusCommandValidator : AbstractValidator<UpdatePRStatusCommand>
{
    public UpdatePRStatusCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("PR ID is required.");

        RuleFor(x => x.Status)
            .IsInEnum().WithMessage("Status must be a valid StatusEnum value.");
    }
}
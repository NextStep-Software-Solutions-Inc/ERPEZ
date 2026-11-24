using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.NoticeToProceeds.Commands.CancelNoticeToProceed;

public class CancelNoticeToProceedCommandValidator : AbstractValidator<CancelNoticeToProceedCommand>
{
    public CancelNoticeToProceedCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Notice to Proceed ID is required.");

        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("Cancellation reason is required.")
            .MaximumLength(4000).WithMessage("Cancellation reason cannot exceed 4000 characters.");
    }
}

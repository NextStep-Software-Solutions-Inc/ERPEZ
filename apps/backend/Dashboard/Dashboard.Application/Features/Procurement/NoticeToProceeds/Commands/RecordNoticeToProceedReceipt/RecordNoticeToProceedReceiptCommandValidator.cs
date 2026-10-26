using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.NoticeToProceeds.Commands.RecordNoticeToProceedReceipt;

public class RecordNoticeToProceedReceiptCommandValidator : AbstractValidator<RecordNoticeToProceedReceiptCommand>
{
    public RecordNoticeToProceedReceiptCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Notice to Proceed ID is required.");

        RuleFor(x => x.EffectiveReceivedAt)
            .NotEmpty().WithMessage("Receipt date (conforme) is required.");

        RuleFor(x => x.EffectiveReceivedByName)
            .NotEmpty().WithMessage("Received by name is required.")
            .MaximumLength(255).WithMessage("Received by name cannot exceed 255 characters.");
    }
}

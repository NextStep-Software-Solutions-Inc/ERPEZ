using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.RequestForQuotation.Commands.ChangeRFQStatus;

public class ChangeRFQStatusCommandValidator : AbstractValidator<ChangeRFQStatusCommand>
{
    public ChangeRFQStatusCommandValidator()
    {
        RuleFor(x => x.RFQId).NotEmpty();

        RuleFor(x => x.Status)
            .Must(s => s is Domain.Enums.StatusEnum.Approved or Domain.Enums.StatusEnum.Returned)
            .WithMessage("This endpoint only handles Approve or Return actions. Use /submit to move Draft to Submitted.");

        RuleFor(x => x.Remarks)
            .NotEmpty()
            .When(x => x.Status == Domain.Enums.StatusEnum.Returned)
            .WithMessage("Remarks are required when returning an RFQ.");
    }
}

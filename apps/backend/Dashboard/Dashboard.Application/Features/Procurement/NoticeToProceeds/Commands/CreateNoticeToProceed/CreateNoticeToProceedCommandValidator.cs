using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.NoticeToProceeds.Commands.CreateNoticeToProceed;

public class CreateNoticeToProceedCommandValidator : AbstractValidator<CreateNoticeToProceedCommand>
{
    public CreateNoticeToProceedCommandValidator()
    {
        RuleFor(x => x.ContractId)
            .NotEmpty().WithMessage("Contract ID is required.");

        RuleFor(x => x.NTPDate)
            .NotEmpty().WithMessage("NTP date is required.");

        RuleFor(x => x.ImplementationPeriodDays)
            .GreaterThan(0).When(x => x.ImplementationPeriodDays.HasValue)
            .WithMessage("Implementation period days must be greater than zero.");
    }
}

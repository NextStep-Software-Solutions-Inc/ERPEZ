using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.NoticeToProceeds.Commands.UpdateNoticeToProceed;

public class UpdateNoticeToProceedCommandValidator : AbstractValidator<UpdateNoticeToProceedCommand>
{
    public UpdateNoticeToProceedCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Notice to Proceed ID is required.");

        RuleFor(x => x.NTPNumber)
            .NotEmpty().WithMessage("NTP number is required.")
            .MaximumLength(100).WithMessage("NTP number cannot exceed 100 characters.");

        RuleFor(x => x.NTPDate)
            .NotEmpty().WithMessage("NTP date is required.");

        RuleFor(x => x.ImplementationPeriodDays)
            .GreaterThan(0).When(x => x.ImplementationPeriodDays.HasValue)
            .WithMessage("Implementation period days must be greater than zero.");
    }
}

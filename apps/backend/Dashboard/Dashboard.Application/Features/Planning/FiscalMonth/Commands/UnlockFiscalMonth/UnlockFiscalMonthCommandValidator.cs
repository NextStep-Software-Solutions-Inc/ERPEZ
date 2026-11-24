using FluentValidation;

namespace ERPEZ.Application.Features.Planning.FiscalMonth.Commands.UnlockFiscalMonth;

public class UnlockFiscalMonthCommandValidator : AbstractValidator<UnlockFiscalMonthCommand>
{
    public UnlockFiscalMonthCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Fiscal Month ID is required.");
    }
}

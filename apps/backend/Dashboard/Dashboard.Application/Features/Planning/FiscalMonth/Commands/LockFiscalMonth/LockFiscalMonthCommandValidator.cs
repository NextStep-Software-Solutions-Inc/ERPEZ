using FluentValidation;

namespace ERPEZ.Application.Features.Planning.FiscalMonth.Commands.LockFiscalMonth;

public class LockFiscalMonthCommandValidator : AbstractValidator<LockFiscalMonthCommand>
{
    public LockFiscalMonthCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Fiscal Month ID is required.");
    }
}

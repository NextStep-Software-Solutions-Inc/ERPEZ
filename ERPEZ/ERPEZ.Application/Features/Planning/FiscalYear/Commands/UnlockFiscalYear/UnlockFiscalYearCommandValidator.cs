using FluentValidation;

namespace ERPEZ.Application.Features.Planning.FiscalYear.Commands.UnlockFiscalYear;

public class UnlockFiscalYearCommandValidator : AbstractValidator<UnlockFiscalYearCommand>
{
    public UnlockFiscalYearCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("Id is required.");
    }
}

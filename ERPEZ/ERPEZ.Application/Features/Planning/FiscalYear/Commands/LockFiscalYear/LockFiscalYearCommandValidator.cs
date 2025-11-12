using FluentValidation;

namespace ERPEZ.Application.Features.Planning.FiscalYear.Commands.LockFiscalYear;

public class LockFiscalYearCommandValidator : AbstractValidator<LockFiscalYearCommand>
{
    public LockFiscalYearCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("Id is required.");
    }
}

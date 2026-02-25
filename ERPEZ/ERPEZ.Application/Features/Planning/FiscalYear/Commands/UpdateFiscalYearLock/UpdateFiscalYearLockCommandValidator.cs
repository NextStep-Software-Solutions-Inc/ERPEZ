using FluentValidation;

namespace ERPEZ.Application.Features.Planning.FiscalYear.Commands.UpdateFiscalYearLock;

public class UpdateFiscalYearLockCommandValidator : AbstractValidator<UpdateFiscalYearLockCommand>
{
    public UpdateFiscalYearLockCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Fiscal year ID is required.");
    }
}

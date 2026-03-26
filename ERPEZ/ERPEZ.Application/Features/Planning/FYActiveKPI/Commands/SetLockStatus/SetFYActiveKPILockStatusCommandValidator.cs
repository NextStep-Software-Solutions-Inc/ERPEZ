using FluentValidation;

namespace ERPEZ.Application.Features.Planning.FYActiveKPI.Commands.SetLockStatus;

public class SetFYActiveKPILockStatusCommandValidator : AbstractValidator<SetFYActiveKPILockStatusCommand>
{
    public SetFYActiveKPILockStatusCommandValidator()
    {
        RuleFor(x => x.FiscalYearId)
            .NotEmpty().WithMessage("FiscalYearId is required.");
    }
}

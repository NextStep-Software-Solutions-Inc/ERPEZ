using FluentValidation;

namespace ERPEZ.Application.Features.Planning.FYActiveKPI.Commands.SetLockStatus;

public class SetFYActiveKPILockStatusCommandValidator : AbstractValidator<SetFYActiveKPILockStatusCommand>
{
    public SetFYActiveKPILockStatusCommandValidator()
    {
        RuleFor(x => x.FiscalYearId)
            .NotEmpty().WithMessage("FiscalYearId is required.");

        RuleFor(x => x.IsLocked)
            .NotNull().WithMessage("IsLocked is required. Pass true to lock or false to unlock.");
    }
}

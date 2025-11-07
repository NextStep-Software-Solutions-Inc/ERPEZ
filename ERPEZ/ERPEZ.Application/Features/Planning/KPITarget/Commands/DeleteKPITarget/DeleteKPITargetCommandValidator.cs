using FluentValidation;

namespace ERPEZ.Application.Features.Planning.KPITarget.Commands.DeleteKPITarget;

public class DeleteKPITargetCommandValidator : AbstractValidator<DeleteKPITargetCommand>
{
    public DeleteKPITargetCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("KPI Target ID is required for deletion.")
            .Must(id => id != Guid.Empty)
            .WithMessage("KPI Target ID must be a valid, non-empty GUID.");
    }
}
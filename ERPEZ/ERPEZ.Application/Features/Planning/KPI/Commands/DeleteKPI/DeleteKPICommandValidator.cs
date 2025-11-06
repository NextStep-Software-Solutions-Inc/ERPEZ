using FluentValidation;

namespace ERPEZ.Application.Features.Planning.KPI.Commands.DeleteKPI;

public class DeleteKPICommandValidator : AbstractValidator<DeleteKPICommand>
{
    public DeleteKPICommandValidator()
    {
        // Primary ID Validation (Required for deletion)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("KPI ID is required for deletion.")
            .Must(id => id != Guid.Empty)
            .WithMessage("KPI ID must be a valid, non-empty GUID.");
    }
}
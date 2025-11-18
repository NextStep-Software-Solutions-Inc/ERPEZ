using FluentValidation;

namespace ERPEZ.Application.Features.Planning.MFOKPI.Commands.DeleteMFOKPI;

public class DeleteMFOKPICommandValidator : AbstractValidator<DeleteMFOKPICommand>
{
    public DeleteMFOKPICommandValidator()
    {
        // Primary ID Validation (Required for deletion)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("MFO KPI ID is required for deletion.")
            .Must(id => id != Guid.Empty)
            .WithMessage("MFO KPI ID must be a valid, non-empty GUID.");
    }
}

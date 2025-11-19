using FluentValidation;

namespace ERPEZ.Application.Features.Planning.OPCRKPI.Commands.DeleteOPCRKPI;

public class DeleteOPCRKPICommandValidator : AbstractValidator<DeleteOPCRKPICommand>
{
    public DeleteOPCRKPICommandValidator()
    {
        // Primary ID Validation (Required for deletion)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("OPCR KPI ID is required for deletion.")
            .Must(id => id != Guid.Empty)
            .WithMessage("OPCR KPI ID must be a valid, non-empty GUID.");
    }
}

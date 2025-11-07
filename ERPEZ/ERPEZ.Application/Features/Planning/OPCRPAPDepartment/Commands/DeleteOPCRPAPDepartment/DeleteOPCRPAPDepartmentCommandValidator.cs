using FluentValidation;

namespace ERPEZ.Application.Features.Planning.OPCRPAPDepartment.Commands.DeleteOPCRPAPDepartment;

public class DeleteOPCRPAPDepartmentCommandValidator : AbstractValidator<DeleteOPCRPAPDepartmentCommand>
{
    public DeleteOPCRPAPDepartmentCommandValidator()
    {
        // Primary ID Validation (Required for deletion)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("OPCR PAP Department ID is required for deletion.")
            .Must(id => id != Guid.Empty)
            .WithMessage("OPCR PAP Department ID must be a valid, non-empty GUID.");
    }
}
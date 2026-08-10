using FluentValidation;

namespace ERPEZ.Application.Features.Planning.OPCRPAPDepartment.Commands.CreateOPCRPAPDepartment;

public class CreateOPCRPAPDepartmentCommandValidator : AbstractValidator<CreateOPCRPAPDepartmentCommand>
{
    public CreateOPCRPAPDepartmentCommandValidator()
    {
        // OPCRActivityId (Required GUID)
        RuleFor(x => x.OPCRActivityId)
            .NotEmpty()
            .WithMessage("OPCR Activity ID is required and must be a valid, non-empty GUID.")
            .Must(id => id != Guid.Empty)
            .WithMessage("OPCR Activity ID must be a valid, non-empty GUID.");

        // OfficeId (Required GUID)
        RuleFor(x => x.OfficeId)
            .NotEmpty()
            .WithMessage("Office ID is required and must be a valid, non-empty GUID.")
            .Must(id => id != Guid.Empty)
            .WithMessage("Office ID must be a valid, non-empty GUID.");

        // Note: Business logic to check for duplicate associations should be placed in the handler.
    }
}

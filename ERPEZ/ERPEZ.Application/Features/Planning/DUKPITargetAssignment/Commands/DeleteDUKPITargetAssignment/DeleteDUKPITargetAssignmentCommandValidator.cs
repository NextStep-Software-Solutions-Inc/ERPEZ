using FluentValidation;

namespace ERPEZ.Application.Features.Planning.DUKPITargetAssignment.Commands.DeleteDUKPITargetAssignment;

public class DeleteDUKPITargetAssignmentCommandValidator : AbstractValidator<DeleteDUKPITargetAssignmentCommand>
{
    public DeleteDUKPITargetAssignmentCommandValidator()
    {
        // Primary ID Validation (Required for deletion)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("DUKPI Target Assignment ID is required for deletion.")
            .Must(id => id != Guid.Empty)
            .WithMessage("DUKPI Target Assignment ID must be a valid, non-empty GUID.");
    }
}

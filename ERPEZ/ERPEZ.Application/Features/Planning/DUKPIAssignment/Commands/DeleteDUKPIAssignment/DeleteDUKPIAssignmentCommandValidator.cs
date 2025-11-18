using FluentValidation;

namespace ERPEZ.Application.Features.Planning.DUKPIAssignment.Commands.DeleteDUKPIAssignment;

public class DeleteDUKPIAssignmentCommandValidator : AbstractValidator<DeleteDUKPIAssignmentCommand>
{
    public DeleteDUKPIAssignmentCommandValidator()
    {
        // Primary ID Validation (Required for deletion)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("DUKPI Assignment ID is required for deletion.")
            .Must(id => id != Guid.Empty)
            .WithMessage("DUKPI Assignment ID must be a valid, non-empty GUID.");
    }
}

using FluentValidation;

namespace ERPEZ.Application.Features.Planning.DUKPIAssignment.Commands.DeleteDUKPIAssignment;

public class DeleteDUKPIAssignmentCommandValidator : AbstractValidator<DeleteDUKPIAssignmentCommand>
{
    public DeleteDUKPIAssignmentCommandValidator()
    {
        // Primary ID Validation (Required for deletion)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("KPI Assignment ID is required for deletion.")
            .Must(id => id != Guid.Empty)
            .WithMessage("KPI Assignment ID must be a valid, non-empty GUID.");
    }
}
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.KPIAssignment.Commands.DeleteKPIAssignment;

public class DeleteKPIAssignmentCommandValidator : AbstractValidator<DeleteKPIAssignmentCommand>
{
    public DeleteKPIAssignmentCommandValidator()
    {
        // Primary ID Validation (Required for deletion)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("KPI Assignment ID is required for deletion.")
            .Must(id => id != Guid.Empty)
            .WithMessage("KPI Assignment ID must be a valid, non-empty GUID.");
    }
}
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.DUKPIAssignment.Commands.UpdateDUKPIAssignment;

public class UpdateDUKPIAssignmentCommandValidator : AbstractValidator<UpdateDUKPIAssignmentCommand>
{
    public UpdateDUKPIAssignmentCommandValidator()
    {
        // Primary ID Validation (Crucial for updates)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("DUKPI Assignment ID is required for update.")
            .Must(id => id != Guid.Empty)
            .WithMessage("DUKPI Assignment ID must be a valid, non-empty GUID.");

        // AllocatedTargetValue (Optional Decimal, Must be positive if present)
        RuleFor(x => x.UpdateDUKPIAssignment.AllocatedTargetValue)
            .NotEmpty()
            .WithMessage("Allocated Target Value is required.")
            .GreaterThan(0)
            .WithMessage("Allocated Target Value must be greater than zero.");
    }
}

using FluentValidation;

namespace ERPEZ.Application.Features.Planning.DUKPIAssignment.Commands.UpdateDUKPIAssignment;

public class UpdateDUKPIAssignmentCommandValidator : AbstractValidator<UpdateDUKPIAssignmentCommand>
{
    public UpdateDUKPIAssignmentCommandValidator()
    {
        // Delivery Unit ID Validation
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Delivery Unit ID is required for update.")
            .Must(id => id != Guid.Empty)
            .WithMessage("Delivery Unit ID must be a valid, non-empty GUID.");

        // Update list validation
        RuleFor(x => x.UpdateDUKPIAssignments)
            .NotEmpty()
            .WithMessage("At least one KPI assignment update is required.");

        RuleForEach(x => x.UpdateDUKPIAssignments)
            .ChildRules(child =>
            {
                child.RuleFor(c => c.TargetId)
                    .NotEmpty()
                    .WithMessage("Target ID is required for each update.")
                    .Must(id => id != Guid.Empty)
                    .WithMessage("Target ID must be a valid, non-empty GUID.");

                child.RuleFor(c => c.AllocatedTargetValue)
                    .GreaterThan(0)
                    .WithMessage("Allocated Target Value must be greater than zero.");
            });
    }
}

using FluentValidation;

namespace ERPEZ.Application.Features.Planning.KPIAssignment.Commands.BulkUpdateKPIAssignmentLockStatus;

public class BulkUpdateKPIAssignmentLockStatusCommandValidator : AbstractValidator<BulkUpdateKPIAssignmentLockStatusCommand>
{
    public BulkUpdateKPIAssignmentLockStatusCommandValidator()
    {
        RuleFor(x => x.Assignments)
            .NotEmpty()
            .WithMessage("At least one KPI lock status update must be provided.");

        RuleForEach(x => x.Assignments).ChildRules(assignment =>
        {
            assignment.RuleFor(x => x.FYActiveKPIId)
                .NotEmpty()
                .WithMessage("FYActiveKPIId is required.");

            assignment.RuleFor(x => x.OfficeAssignments)
                .NotEmpty()
                .WithMessage("At least one office lock status update must be provided for each KPI.");

            assignment.RuleForEach(x => x.OfficeAssignments).ChildRules(office =>
            {
                office.RuleFor(x => x.OfficeId)
                    .NotEmpty()
                    .WithMessage("OfficeId is required.");
            });
        });
    }
}

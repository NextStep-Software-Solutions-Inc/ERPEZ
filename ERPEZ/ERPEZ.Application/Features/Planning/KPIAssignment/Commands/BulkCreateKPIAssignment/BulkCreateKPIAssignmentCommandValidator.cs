using FluentValidation;

namespace ERPEZ.Application.Features.Planning.KPIAssignment.Commands.BulkCreateKPIAssignment;

public class BulkCreateKPIAssignmentCommandValidator : AbstractValidator<BulkCreateKPIAssignmentCommand>
{
    public BulkCreateKPIAssignmentCommandValidator()
    {
        RuleFor(x => x.Assignments)
            .NotEmpty()
            .WithMessage("At least one KPI assignment must be provided.");

        RuleForEach(x => x.Assignments).ChildRules(assignment =>
        {
            assignment.RuleFor(x => x.FYActiveKPIId)
                .NotEmpty()
                .WithMessage("FYActiveKPIId is required.");

            assignment.RuleFor(x => x.OfficeAssignments)
                .NotEmpty()
                .WithMessage("At least one office assignment must be provided for each KPI.");

            assignment.RuleForEach(x => x.OfficeAssignments).ChildRules(office =>
            {
                office.RuleFor(x => x.OfficeId)
                    .NotEmpty()
                    .WithMessage("OfficeId is required.");

                office.RuleFor(x => x.AssignedTargetAnnual)
                    .GreaterThanOrEqualTo(0)
                    .WithMessage("Assigned annual target must be greater than or equal to 0.");

                office.RuleFor(x => x.AssignedTargetQ1)
                    .GreaterThanOrEqualTo(0)
                    .WithMessage("Q1 target must be greater than or equal to 0.")
                    .When(x => x.AssignedTargetQ1.HasValue);

                office.RuleFor(x => x.AssignedTargetQ2)
                    .GreaterThanOrEqualTo(0)
                    .WithMessage("Q2 target must be greater than or equal to 0.")
                    .When(x => x.AssignedTargetQ2.HasValue);

                office.RuleFor(x => x.AssignedTargetQ3)
                    .GreaterThanOrEqualTo(0)
                    .WithMessage("Q3 target must be greater than or equal to 0.")
                    .When(x => x.AssignedTargetQ3.HasValue);

                office.RuleFor(x => x.AssignedTargetQ4)
                    .GreaterThanOrEqualTo(0)
                    .WithMessage("Q4 target must be greater than or equal to 0.")
                    .When(x => x.AssignedTargetQ4.HasValue);
            });
        });
    }
}

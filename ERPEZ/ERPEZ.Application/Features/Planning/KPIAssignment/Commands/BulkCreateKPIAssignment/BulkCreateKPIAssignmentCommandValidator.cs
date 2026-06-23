using FluentValidation;
using ERPEZ.Domain.Enums;

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

                office.RuleFor(x => x.Source)
                    .NotEmpty()
                    .WithMessage("Source is required.")
                    .Must(source =>
                    {
                        if (string.IsNullOrWhiteSpace(source))
                            return false;
                        // Reject numeric inputs like "0", "1"
                        if (int.TryParse(source, out _))
                            return false;
                        return Enum.TryParse<KPIAssignmentSourceEnum>(source, true, out _);
                    })
                    .WithMessage("Source must be 'Assigned' or 'Shopped'.");

                office.RuleFor(x => x.AssignedTargetAnnual)
                    .NotNull()
                    .When(x => string.Equals(x.Source, "Assigned", StringComparison.OrdinalIgnoreCase))
                    .WithMessage("For Source='Assigned', AssignedTargetAnnual is required.");

                office.RuleFor(x => x.AssignedTargetAnnual)
                    .GreaterThan(0)
                    .When(x => x.AssignedTargetAnnual.HasValue && string.Equals(x.Source, "Assigned", StringComparison.OrdinalIgnoreCase))
                    .WithMessage("For Source='Assigned', AssignedTargetAnnual must be greater than 0.");

                office.RuleFor(x => x.AssignedTargetAnnual)
                    .Null()
                    .When(x => string.Equals(x.Source, "Shopped", StringComparison.OrdinalIgnoreCase))
                    .WithMessage("For Source='Shopped', AssignedTargetAnnual must be null.");

                office.RuleFor(x => x.AssignedTargetQ1)
                    .GreaterThanOrEqualTo(0)
                    .WithMessage("Q1 target must be greater than or equal to 0.")
                    .When(x => x.AssignedTargetQ1.HasValue && string.Equals(x.Source, "Assigned", StringComparison.OrdinalIgnoreCase));

                office.RuleFor(x => x.AssignedTargetQ1)
                    .Null()
                    .When(x => string.Equals(x.Source, "Shopped", StringComparison.OrdinalIgnoreCase))
                    .WithMessage("For Source='Shopped', AssignedTargetQ1 must be null.");

                office.RuleFor(x => x.AssignedTargetQ2)
                    .GreaterThanOrEqualTo(0)
                    .WithMessage("Q2 target must be greater than or equal to 0.")
                    .When(x => x.AssignedTargetQ2.HasValue && string.Equals(x.Source, "Assigned", StringComparison.OrdinalIgnoreCase));

                office.RuleFor(x => x.AssignedTargetQ2)
                    .Null()
                    .When(x => string.Equals(x.Source, "Shopped", StringComparison.OrdinalIgnoreCase))
                    .WithMessage("For Source='Shopped', AssignedTargetQ2 must be null.");

                office.RuleFor(x => x.AssignedTargetQ3)
                    .GreaterThanOrEqualTo(0)
                    .WithMessage("Q3 target must be greater than or equal to 0.")
                    .When(x => x.AssignedTargetQ3.HasValue && string.Equals(x.Source, "Assigned", StringComparison.OrdinalIgnoreCase));

                office.RuleFor(x => x.AssignedTargetQ3)
                    .Null()
                    .When(x => string.Equals(x.Source, "Shopped", StringComparison.OrdinalIgnoreCase))
                    .WithMessage("For Source='Shopped', AssignedTargetQ3 must be null.");

                office.RuleFor(x => x.AssignedTargetQ4)
                    .GreaterThanOrEqualTo(0)
                    .WithMessage("Q4 target must be greater than or equal to 0.")
                    .When(x => x.AssignedTargetQ4.HasValue && string.Equals(x.Source, "Assigned", StringComparison.OrdinalIgnoreCase));

                office.RuleFor(x => x.AssignedTargetQ4)
                    .Null()
                    .When(x => string.Equals(x.Source, "Shopped", StringComparison.OrdinalIgnoreCase))
                    .WithMessage("For Source='Shopped', AssignedTargetQ4 must be null.");
            });
        });
    }
}

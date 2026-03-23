using FluentValidation;

namespace ERPEZ.Application.Features.Planning.KPIAssignment.Commands.UpdateKPIAssignment;

public class UpdateKPIAssignmentCommandValidator : AbstractValidator<UpdateKPIAssignmentCommand>
{
    public UpdateKPIAssignmentCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("KPI Assignment ID is required.");

        RuleFor(x => x.AssignedTargetAnnual)
            .GreaterThanOrEqualTo(0)
            .When(x => x.AssignedTargetAnnual.HasValue)
            .WithMessage("Assigned Target Annual must be greater than or equal to 0.");

        RuleFor(x => x.AssignedTargetQ1)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Assigned Target Q1 must be greater than or equal to 0.")
            .When(x => x.AssignedTargetQ1.HasValue);

        RuleFor(x => x.AssignedTargetQ2)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Assigned Target Q2 must be greater than or equal to 0.")
            .When(x => x.AssignedTargetQ2.HasValue);

        RuleFor(x => x.AssignedTargetQ3)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Assigned Target Q3 must be greater than or equal to 0.")
            .When(x => x.AssignedTargetQ3.HasValue);

        RuleFor(x => x.AssignedTargetQ4)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Assigned Target Q4 must be greater than or equal to 0.")
            .When(x => x.AssignedTargetQ4.HasValue);
    }
}

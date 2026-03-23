using FluentValidation;

namespace ERPEZ.Application.Features.Planning.KPIAssignment.Commands.CreateKPIAssignment;

public class CreateKPIAssignmentCommandValidator : AbstractValidator<CreateKPIAssignmentCommand>
{
    public CreateKPIAssignmentCommandValidator()
    {
        RuleFor(x => x.FYActiveKPIId)
            .NotEmpty()
            .WithMessage("FYActiveKPIId is required.");

        RuleFor(x => x.OfficeId)
            .NotEmpty()
            .WithMessage("OfficeId is required.");

        // Validate Source enum value
        RuleFor(x => x.Source)
            .NotEmpty()
            .WithMessage("Source is required.")
            .Must(source => source == "Assigned" || source == "Shopped")
            .WithMessage("Source must be 'Assigned' or 'Shopped'.");

        // AssignedTargetAnnual validation: required for Assigned, must be null for Shopped
        RuleFor(x => x.AssignedTargetAnnual)
            .NotNull()
            .GreaterThan(0)
            .When(x => x.Source == "Assigned")
            .WithMessage("For Source='Assigned', AssignedTargetAnnual is required and must be greater than 0.");

        RuleFor(x => x.AssignedTargetAnnual)
            .Null()
            .When(x => x.Source == "Shopped")
            .WithMessage("For Source='Shopped', AssignedTargetAnnual must be null.");

        // Quarterly targets validation: only for Assigned source
        RuleFor(x => x.AssignedTargetQ1)
            .GreaterThanOrEqualTo(0)
            .When(x => x.AssignedTargetQ1.HasValue && x.Source == "Assigned")
            .WithMessage("AssignedTargetQ1 must be greater than or equal to 0.");

        RuleFor(x => x.AssignedTargetQ2)
            .GreaterThanOrEqualTo(0)
            .When(x => x.AssignedTargetQ2.HasValue && x.Source == "Assigned")
            .WithMessage("AssignedTargetQ2 must be greater than or equal to 0.");

        RuleFor(x => x.AssignedTargetQ3)
            .GreaterThanOrEqualTo(0)
            .When(x => x.AssignedTargetQ3.HasValue && x.Source == "Assigned")
            .WithMessage("AssignedTargetQ3 must be greater than or equal to 0.");

        RuleFor(x => x.AssignedTargetQ4)
            .GreaterThanOrEqualTo(0)
            .When(x => x.AssignedTargetQ4.HasValue && x.Source == "Assigned")
            .WithMessage("AssignedTargetQ4 must be greater than or equal to 0.");

        // Validate quarterly alignment if provided
        RuleFor(x => x)
            .Must(command => ValidateQuarterlyAlignment(command))
            .When(x => (x.AssignedTargetQ1.HasValue || x.AssignedTargetQ2.HasValue || 
                       x.AssignedTargetQ3.HasValue || x.AssignedTargetQ4.HasValue) && x.Source == "Assigned")
            .WithMessage("If quarterly targets are provided for Assigned source, all quarters must be specified and sum to the annual target.");
    }

    private bool ValidateQuarterlyAlignment(CreateKPIAssignmentCommand command)
    {
        // Only validate for Assigned source where AssignedTargetAnnual is not null
        if (!command.AssignedTargetAnnual.HasValue)
            return true;

        // If any quarterly target is provided, all must be provided
        if (command.AssignedTargetQ1.HasValue || command.AssignedTargetQ2.HasValue || 
            command.AssignedTargetQ3.HasValue || command.AssignedTargetQ4.HasValue)
        {
            if (!command.AssignedTargetQ1.HasValue || !command.AssignedTargetQ2.HasValue || 
                !command.AssignedTargetQ3.HasValue || !command.AssignedTargetQ4.HasValue)
            {
                return false;
            }

            var sum = command.AssignedTargetQ1.Value + command.AssignedTargetQ2.Value + 
                      command.AssignedTargetQ3.Value + command.AssignedTargetQ4.Value;

            return Math.Abs(sum - command.AssignedTargetAnnual.Value) < 0.0001m;
        }

        return true;
    }
}

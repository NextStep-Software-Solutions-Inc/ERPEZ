using FluentValidation;

namespace ERPEZ.Application.Features.Planning.FYActiveKPI.Commands.ActivateFYActiveKPI;

public class ActivateFYActiveKPICommandValidator : AbstractValidator<ActivateFYActiveKPICommand>
{
    public ActivateFYActiveKPICommandValidator()
    {
        RuleFor(x => x.FiscalYearId)
            .NotEmpty()
            .WithMessage("FiscalYearId is required.");

        RuleFor(x => x.MasterKPIId)
            .NotEmpty()
            .WithMessage("MasterKPIId is required.");

        RuleFor(x => x.AgencyTargetAnnual)
            .GreaterThanOrEqualTo(0)
            .WithMessage("AgencyTargetAnnual must be greater than or equal to 0.");

        RuleFor(x => x.AgencyTargetQ1)
            .GreaterThanOrEqualTo(0)
            .When(x => x.AgencyTargetQ1.HasValue)
            .WithMessage("AgencyTargetQ1 must be greater than or equal to 0.");

        RuleFor(x => x.AgencyTargetQ2)
            .GreaterThanOrEqualTo(0)
            .When(x => x.AgencyTargetQ2.HasValue)
            .WithMessage("AgencyTargetQ2 must be greater than or equal to 0.");

        RuleFor(x => x.AgencyTargetQ3)
            .GreaterThanOrEqualTo(0)
            .When(x => x.AgencyTargetQ3.HasValue)
            .WithMessage("AgencyTargetQ3 must be greater than or equal to 0.");

        RuleFor(x => x.AgencyTargetQ4)
            .GreaterThanOrEqualTo(0)
            .When(x => x.AgencyTargetQ4.HasValue)
            .WithMessage("AgencyTargetQ4 must be greater than or equal to 0.");

        // Validate that quarterly targets sum to annual target if provided
        RuleFor(x => x)
            .Must(command => ValidateQuarterlyTargets(command))
            .When(x => x.AgencyTargetQ1.HasValue || x.AgencyTargetQ2.HasValue || 
                       x.AgencyTargetQ3.HasValue || x.AgencyTargetQ4.HasValue)
            .WithMessage("If quarterly targets are provided, all quarters must be specified and sum to the annual target.");
    }

    private bool ValidateQuarterlyTargets(ActivateFYActiveKPICommand command)
    {
        // If any quarterly target is provided, all must be provided
        if (command.AgencyTargetQ1.HasValue || command.AgencyTargetQ2.HasValue || 
            command.AgencyTargetQ3.HasValue || command.AgencyTargetQ4.HasValue)
        {
            if (!command.AgencyTargetQ1.HasValue || !command.AgencyTargetQ2.HasValue || 
                !command.AgencyTargetQ3.HasValue || !command.AgencyTargetQ4.HasValue)
            {
                return false;
            }

            var sum = command.AgencyTargetQ1.Value + command.AgencyTargetQ2.Value + 
                      command.AgencyTargetQ3.Value + command.AgencyTargetQ4.Value;

            // Allow small tolerance for decimal comparison
            return Math.Abs(sum - command.AgencyTargetAnnual) < 0.0001m;
        }

        return true;
    }
}

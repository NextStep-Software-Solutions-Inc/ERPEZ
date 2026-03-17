using ERPEZ.Application.Features.Planning.FYActiveKPI.Dtos;
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.FYActiveKPI.Commands.SetTargets;

public class SetFYActiveKPITargetsCommandValidator : AbstractValidator<SetFYActiveKPITargetsCommand>
{
    public SetFYActiveKPITargetsCommandValidator()
    {
        RuleFor(x => x.Targets)
            .NotEmpty()
            .WithMessage("At least one KPI target must be provided.")
            .Must(targets => targets.Count > 0)
            .WithMessage("At least one KPI target must be provided.");

        RuleForEach(x => x.Targets)
            .SetValidator(new SetTargetRequestValidator());
    }
}

public class SetTargetRequestValidator : AbstractValidator<SetTargetRequest>
{
    public SetTargetRequestValidator()
    {
        RuleFor(x => x.FYActiveKPIId)
            .NotEmpty()
            .WithMessage("FYActiveKPIId is required.");

        RuleFor(x => x.AgencyTargetAnnual)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Agency annual target must be greater than or equal to 0.");

        RuleFor(x => x.AgencyTargetQ1)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Q1 target must be greater than or equal to 0.")
            .When(x => x.AgencyTargetQ1.HasValue);

        RuleFor(x => x.AgencyTargetQ2)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Q2 target must be greater than or equal to 0.")
            .When(x => x.AgencyTargetQ2.HasValue);

        RuleFor(x => x.AgencyTargetQ3)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Q3 target must be greater than or equal to 0.")
            .When(x => x.AgencyTargetQ3.HasValue);

        RuleFor(x => x.AgencyTargetQ4)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Q4 target must be greater than or equal to 0.")
            .When(x => x.AgencyTargetQ4.HasValue);
    }
}


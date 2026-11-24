using FluentValidation;

namespace ERPEZ.Application.Features.Planning.ProcurementModeThreshold.Commands.CreateProcurementModeThreshold;

public class CreateProcurementModeThresholdCommandValidator : AbstractValidator<CreateProcurementModeThresholdCommand>
{
    public CreateProcurementModeThresholdCommandValidator()
    {
        RuleFor(x => x.ProcurementModeId)
            .NotEmpty()
            .WithMessage("Procurement mode is required.");

        RuleFor(x => x.MinThreshold)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Minimum threshold must be greater than or equal to 0.");

        RuleFor(x => x.MaxThreshold)
            .GreaterThan(x => x.MinThreshold)
            .WithMessage("Maximum threshold must be greater than minimum threshold.")
            .When(x => x.MaxThreshold.HasValue);

        RuleFor(x => x.EffectivityStart)
            .NotEmpty()
            .WithMessage("Effectivity start date is required.");

        RuleFor(x => x.EffectivityEnd)
            .GreaterThan(x => x.EffectivityStart)
            .WithMessage("Effectivity end date must be after the start date.")
            .When(x => x.EffectivityEnd.HasValue);
    }
}

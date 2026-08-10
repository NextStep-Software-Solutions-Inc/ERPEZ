using FluentValidation;

namespace ERPEZ.Application.Features.Planning.ProcurementPolicyConfig.Commands.UpdateProcurementPolicyConfig;

public class UpdateProcurementPolicyConfigRequestValidator : AbstractValidator<UpdateProcurementPolicyConfigRequest>
{
    public UpdateProcurementPolicyConfigRequestValidator()
    {
        RuleFor(x => x.ProcurementModeThresholdId)
            .NotEmpty()
            .WithMessage("Procurement Mode Threshold is required.");

        RuleFor(x => x.MinAmount)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Min Amount must be greater than or equal to 0.");

        RuleFor(x => x.MaxAmount)
            .GreaterThanOrEqualTo(x => x.MinAmount)
            .When(x => x.MaxAmount.HasValue)
            .WithMessage("Max Amount must be greater than or equal to Min Amount.");
    }
}

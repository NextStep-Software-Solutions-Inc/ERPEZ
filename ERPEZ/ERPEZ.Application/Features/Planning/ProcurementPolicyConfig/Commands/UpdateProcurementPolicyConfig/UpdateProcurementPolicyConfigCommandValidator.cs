using FluentValidation;

namespace ERPEZ.Application.Features.Planning.ProcurementPolicyConfig.Commands.UpdateProcurementPolicyConfig;

public class UpdateProcurementPolicyConfigCommandValidator : AbstractValidator<UpdateProcurementPolicyConfigCommand>
{
    public UpdateProcurementPolicyConfigCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Procurement Policy Configuration Id is required.");

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

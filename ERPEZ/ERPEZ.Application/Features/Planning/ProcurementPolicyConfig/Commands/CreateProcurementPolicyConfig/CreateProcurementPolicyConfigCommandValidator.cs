using FluentValidation;

namespace ERPEZ.Application.Features.Planning.ProcurementPolicyConfig.Commands.CreateProcurementPolicyConfig;

public class CreateProcurementPolicyConfigCommandValidator : AbstractValidator<CreateProcurementPolicyConfigCommand>
{
    public CreateProcurementPolicyConfigCommandValidator()
    {
        RuleFor(x => x.FiscalYearId)
            .NotEmpty()
            .WithMessage("Fiscal Year is required.");

        RuleFor(x => x.ProcurementModeId)
            .NotEmpty()
            .WithMessage("Procurement Mode is required.");

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

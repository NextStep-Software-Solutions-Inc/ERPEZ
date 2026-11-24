using FluentValidation;

namespace ERPEZ.Application.Features.Planning.DeliveryUnit.Commands.AssignKPIsToDeliveryUnit;

public class AssignKPIsToDeliveryUnitCommandValidator : AbstractValidator<AssignKPIsToDeliveryUnitCommand>
{
    public AssignKPIsToDeliveryUnitCommandValidator()
    {
        // DeliveryUnitId (Required GUID)
        RuleFor(x => x.DeliveryUnitId)
            .NotEmpty()
            .WithMessage("Delivery Unit ID is required and must be a valid, non-empty GUID.");

        // KPITargetId (Required GUID)
        RuleForEach(x => x.KPITargets)
            .ChildRules(target =>
            {
                target.RuleFor(x => x.KPIId)
                    .NotEmpty()
                    .WithMessage("KPI ID is required and must be a valid, non-empty GUID.");

                target.RuleFor(x => x.TargetId)
                    .NotEmpty()
                    .WithMessage("Target ID is required and must be a valid, non-empty GUID.");
                    
                target.RuleFor(x => x.AllocatedTargetValue)
                    .GreaterThanOrEqualTo(0)
                    .WithMessage("Allocated Target Value must be greater than or equal to zero.");

            })
            .When(x => x.KPITargets != null && x.KPITargets.Count > 0);

        // Additional validation: If more than one target, at least one must be greater than 0
        RuleFor(x => x.KPITargets)
            .Must(targets => targets.Count <= 1 || targets.Any(t => t.AllocatedTargetValue > 0))
            .WithMessage("When multiple KPI targets are assigned, at least one allocated target value must be greater than 0.")
            .When(x => x.KPITargets != null && x.KPITargets.Count > 0);
    }
}
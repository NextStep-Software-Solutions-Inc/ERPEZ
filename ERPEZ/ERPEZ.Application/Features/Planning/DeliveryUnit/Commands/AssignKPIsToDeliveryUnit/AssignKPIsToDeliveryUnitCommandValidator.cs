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
                    .NotEmpty()
                    .WithMessage("Allocated Target Value is required.")
                    .GreaterThan(0)
                    .WithMessage("Allocated Target Value must be greater than zero.");

            })
            .When(x => x.KPITargets != null && x.KPITargets.Count > 0);
    }
}
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.DUKPIAssignment.Commands.CreateDUKPIAssignment;

public class CreateDUKPIAssignmentCommandValidator : AbstractValidator<CreateDUKPIAssignmentCommand>
{
    public CreateDUKPIAssignmentCommandValidator()
    {
        // KPIId (Required GUID)
        RuleFor(x => x.KPIId)
            .NotEmpty()
            .WithMessage("KPI ID is required and must be a valid, non-empty GUID.");

        // DeliveryUnitId (Required GUID)
        RuleFor(x => x.DeliveryUnitId)
            .NotEmpty()
            .WithMessage("Delivery Unit ID is required and must be a valid, non-empty GUID.");

        // KPITargetId (Required GUID)
        RuleForEach(x => x.DUKPITargets)
            .ChildRules(target =>
            {
                target.RuleFor(x => x.TargetId)
                    .NotEmpty()
                    .WithMessage("Target ID is required and must be a valid, non-empty GUID.");
                target.RuleFor(x => x.AllocatedTargetValue)
                    .NotEmpty()
                    .WithMessage("Allocated Target Value is required.")
                    .GreaterThan(0)
                    .WithMessage("Allocated Target Value must be greater than zero.");

            });
    }
}

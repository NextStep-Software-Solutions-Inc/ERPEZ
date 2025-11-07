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
        RuleFor(x => x.KPITargetId)
            .NotEmpty()
            .WithMessage("KPI Target ID is required and must be a valid, non-empty GUID.");

        // AllocatedTargetValue (Required Decimal, Must be positive)
        RuleFor(x => x.AllocatedTargetValue)
            .NotEmpty()
            .WithMessage("Allocated Target Value is required.")
            .GreaterThan(0)
            .WithMessage("Allocated Target Value must be greater than zero.");
    }
}
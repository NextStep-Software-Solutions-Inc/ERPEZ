using FluentValidation;

namespace ERPEZ.Application.Features.Planning.DUAllocation.Commands.UpdateDUAllocation;

public class UpdateDUAllocationCommandValidator : AbstractValidator<UpdateDUAllocationCommand>
{
    public UpdateDUAllocationCommandValidator()
    {
        // 1. Primary ID Validation (Crucial for updates)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Allocation ID is required for update.")
            .Must(id => id != Guid.Empty)
            .WithMessage("Allocation ID must be a valid, non-empty GUID.");

        // 2. DeliveryUnitId (Required GUID)
        RuleFor(x => x.UpdateDUAllocation.DeliveryUnitId)
            .NotEmpty()
            .WithMessage("Delivery Unit ID is required and must be a valid, non-empty GUID.");

        // 3. Purpose (Required String, Min/Max Length)
        RuleFor(x => x.UpdateDUAllocation.Purpose)
            .NotEmpty()
            .WithMessage("Purpose is required.")
            .MinimumLength(5)
            .WithMessage("Purpose must be at least 5 characters long.")
            .MaximumLength(500)
            .WithMessage("Purpose cannot exceed 500 characters.");

        // 4. Amount (Required Decimal, Positive Value)
        RuleFor(x => x.UpdateDUAllocation.Amount)
            .GreaterThan(0)
            .WithMessage("Amount must be a positive value greater than zero.");
    }
}

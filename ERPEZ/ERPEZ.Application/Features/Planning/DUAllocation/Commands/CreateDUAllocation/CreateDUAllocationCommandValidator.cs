using FluentValidation;

namespace ERPEZ.Application.Features.Planning.DUAllocation.Commands.CreateDUAllocation;

public class CreateDUAllocationCommandValidator : AbstractValidator<CreateDUAllocationCommand>
{
    public CreateDUAllocationCommandValidator()
    {
        // 1. DeliveryUnitId (Required GUID)
        RuleFor(x => x.DeliveryUnitId)
            .NotEmpty()
            .WithMessage("Delivery Unit ID is required and must be a valid, non-empty GUID.");

        // 2. Purpose (Required String, Min/Max Length)
        RuleFor(x => x.Purpose)
            .NotEmpty()
            .WithMessage("Purpose is required.")
            .MinimumLength(5)
            .WithMessage("Purpose must be at least 5 characters long.")
            .MaximumLength(500)
            .WithMessage("Purpose cannot exceed 500 characters.");

        // 3. Amount (Required Decimal, Positive Value)
        RuleFor(x => x.Amount)
            .GreaterThan(0)
            .WithMessage("Amount must be a positive value greater than zero.");
    }
}

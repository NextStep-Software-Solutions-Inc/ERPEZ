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

        // 4. DUFundAllocations (Collection Validation)
        RuleForEach(x => x.DUFundAllocations).ChildRules(duFundAllocation =>
        {
            // a. ReceivedFundId (Required GUID)
            duFundAllocation.RuleFor(fund => fund.ReceivedFundId)
                .NotEmpty()
                .WithMessage("Received Fund ID is required and must be a valid, non-empty GUID.");

            // b. Amount (Required Decimal, Positive Value)
            duFundAllocation.RuleFor(fund => fund.Amount)
                .GreaterThan(0)
                .WithMessage("Fund Allocation Amount must be a positive value greater than zero.");
        });

        RuleFor(x => x.DUFundAllocations)
            .Must(duFundAllocations => duFundAllocations != null && duFundAllocations.Count > 0)
            .WithMessage("At least one DU Fund Allocation is required.");

        RuleFor(x => x)
            .Must(x => x.DUFundAllocations != null && x.DUFundAllocations.Sum(fund => fund.Amount) <= x.Amount)
            .WithMessage("The total of DU Fund Allocations must not exceed the Amount.");
    }
}
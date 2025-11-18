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

        // 2. Purpose (Optional but if provided, validate)
        When(x => x.UpdateDUAllocation?.Purpose != null, () =>
        {
            RuleFor(x => x.UpdateDUAllocation!.Purpose)
                .NotEmpty()
                .WithMessage("Purpose cannot be empty if provided.")
                .MinimumLength(5)
                .WithMessage("Purpose must be at least 5 characters long.")
                .MaximumLength(500)
                .WithMessage("Purpose cannot exceed 500 characters.");
        });

        // 3. Amount (Optional but if provided, validate)
        When(x => x.UpdateDUAllocation?.Amount.HasValue == true, () =>
        {
            RuleFor(x => x.UpdateDUAllocation!.Amount)
                .GreaterThan(0)
                .WithMessage("Amount must be a positive value greater than zero.");
        });

        // 4. DUFundAllocations (Collection Validation)
        When(x => x.UpdateDUAllocation?.DUFundAllocations != null, () =>
        {
            RuleForEach(x => x.UpdateDUAllocation!.DUFundAllocations).ChildRules(duFundAllocation =>
            {
                // a. ReceivedFundId (Required GUID)
                duFundAllocation.RuleFor(fund => fund.ReceivedFundId)
                    .NotEmpty()
                    .WithMessage("Received Fund ID is required and must be a valid, non-empty GUID.");

                // b. Amount (Required Decimal, Positive Value)
                duFundAllocation.RuleFor(fund => fund.Amount)
                    .NotEmpty()
                    .WithMessage("Fund Allocation Amount is required.")
                    .GreaterThan(0)
                    .WithMessage("Fund Allocation Amount must be a positive value greater than zero.");
            });

            RuleFor(x => x.UpdateDUAllocation!.DUFundAllocations)
                .Must(duFundAllocations => duFundAllocations != null && duFundAllocations.Count > 0)
                .WithMessage("At least one DU Fund Allocation is required.");

            // Cross-property validation for total allocation amount
            RuleFor(x => x)
                .Must(x =>
                {
                    if (x.UpdateDUAllocation?.DUFundAllocations == null || !x.UpdateDUAllocation.Amount.HasValue)
                        return true; // Skip if no allocations or no amount specified

                    var totalAllocation = x.UpdateDUAllocation.DUFundAllocations.Sum(fund => fund.Amount);
                    return totalAllocation <= x.UpdateDUAllocation.Amount.Value;
                })
                .WithMessage("The total of DU Fund Allocations must not exceed the Amount.");
        });
    }
}
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.DUFundAllocation.Commands.UpdateDUFundAllocation;

public class UpdateDUFundAllocationCommandValidator : AbstractValidator<UpdateDUFundAllocationCommand>
{
    public UpdateDUFundAllocationCommandValidator()
    {
        // Primary ID Validation (Crucial for updates)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Fund Allocation ID is required for update.")
            .Must(id => id != Guid.Empty)
            .WithMessage("Fund Allocation ID must be a valid, non-empty GUID.");

        // DUAllocationId (Required GUID)
        RuleFor(x => x.UpdateDUFundAllocation.DUAllocationId)
            .NotEmpty()
            .WithMessage("DU Allocation ID is required and must be a valid, non-empty GUID.");

        // ReceivedFundId (Required GUID)
        RuleFor(x => x.UpdateDUFundAllocation.ReceivedFundId)
            .NotEmpty()
            .WithMessage("Received Fund ID is required and must be a valid, non-empty GUID.");

        // Amount (Required Decimal, Positive Value)
        RuleFor(x => x.UpdateDUFundAllocation.Amount)
            .GreaterThan(0)
            .WithMessage("Amount must be a positive value greater than zero.");
    }
}
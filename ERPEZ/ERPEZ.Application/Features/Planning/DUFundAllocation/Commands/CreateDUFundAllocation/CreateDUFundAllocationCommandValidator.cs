using FluentValidation;

namespace ERPEZ.Application.Features.Planning.DUFundAllocation.Commands.CreateDUFundAllocation;

public class CreateDUFundAllocationCommandValidator : AbstractValidator<CreateDUFundAllocationCommand>
{
    public CreateDUFundAllocationCommandValidator()
    {
        // DUAllocationId (Required GUID)
        RuleFor(x => x.DUAllocationId)
            .NotEmpty()
            .WithMessage("DU Allocation ID is required and must be a valid, non-empty GUID.");

        // ReceivedFundId (Required GUID)
        RuleFor(x => x.ReceivedFundId)
            .NotEmpty()
            .WithMessage("Received Fund ID is required and must be a valid, non-empty GUID.");

        // Amount (Required Decimal, Zero or Positive Value)
        RuleFor(x => x.Amount)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Amount must be zero or greater.");
    }
}
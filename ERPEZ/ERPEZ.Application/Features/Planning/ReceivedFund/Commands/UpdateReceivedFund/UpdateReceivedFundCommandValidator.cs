using FluentValidation;

namespace ERPEZ.Application.Features.Planning.ReceivedFund.Commands.UpdateReceivedFund;

public class UpdateReceivedFundCommandValidator : AbstractValidator<UpdateReceivedFundCommand>
{
    public UpdateReceivedFundCommandValidator()
    {
        // 1. Primary ID Validation (Crucial for updates)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Received Fund ID is required for update.")
            .Must(id => id != Guid.Empty)
            .WithMessage("Received Fund ID must be a valid, non-empty GUID.");

        // 2. FundSourceId (Required GUID)
        RuleFor(x => x.UpdateReceivedFund.FundSourceId)
            .NotEmpty()
            .WithMessage("Fund Source ID is required and must be a valid, non-empty GUID.");

        // 3. Amount (Required Decimal, Must be Positive)
        RuleFor(x => x.UpdateReceivedFund.Amount)
            .GreaterThan(0) // Funds received should typically be greater than zero
            .WithMessage("Amount must be a positive number.");
    }
}
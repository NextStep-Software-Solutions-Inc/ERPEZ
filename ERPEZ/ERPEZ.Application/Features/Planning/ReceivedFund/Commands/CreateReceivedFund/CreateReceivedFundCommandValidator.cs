using FluentValidation;

namespace ERPEZ.Application.Features.Planning.ReceivedFund.Commands.CreateReceivedFund;

public class CreateReceivedFundCommandValidator : AbstractValidator<CreateReceivedFundCommand>
{
    public CreateReceivedFundCommandValidator()
    {
        // FundSourceId (Required GUID)
        RuleFor(x => x.FundSourceId)
            .NotEmpty()
            .WithMessage("Fund Source ID is required and must be a valid, non-empty GUID.");

        // Amount (Required Decimal, Must be Positive)
        RuleFor(x => x.Amount)
            .GreaterThan(0) // Funds received should typically be greater than zero
            .WithMessage("Amount must be a positive number.");

        // ReceivedDate (Required DateTime, Must not be in the future)
        RuleFor(x => x.ReceivedDate)
            .NotEmpty()
            .WithMessage("Received Date is required.")
            .LessThanOrEqualTo(DateTime.UtcNow)
            .WithMessage("Received Date cannot be in the future.");
        
        // Description (Optional, Max Length 500)
        RuleFor(x => x.Description)
            .MaximumLength(500)
            .WithMessage("Description cannot exceed 500 characters.");
    }
}
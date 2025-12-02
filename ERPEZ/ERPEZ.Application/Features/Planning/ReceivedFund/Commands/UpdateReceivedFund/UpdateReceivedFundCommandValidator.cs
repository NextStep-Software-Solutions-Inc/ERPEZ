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

        // 2. Amount (Required Decimal, Must be Positive if provided)
        When(x => x.UpdateReceivedFund.Amount != default(decimal), () =>
        {
            RuleFor(x => x.UpdateReceivedFund.Amount)
                .GreaterThan(0) // Funds received should typically be greater than zero
                .WithMessage("Amount must be a positive number.");
        });

        // 3. ReceivedDate (Required DateTime, Must not be in the future if provided)
        When(x => x.UpdateReceivedFund.ReceivedDate != default(DateTime), () =>
        {
            RuleFor(x => x.UpdateReceivedFund.ReceivedDate)
                .NotEmpty()
                .WithMessage("Received Date is required.")
                .Must(receivedDate => receivedDate <= DateTime.UtcNow)
                .WithMessage("Received Date cannot be in the future.");
        });

        // 4. Description (Optional, Max Length 500)
        When(x => !string.IsNullOrEmpty(x.UpdateReceivedFund.Description), () =>
        {
            RuleFor(x => x.UpdateReceivedFund.Description)
            .MaximumLength(500)
            .WithMessage("Description cannot exceed 500 characters.");
        });
        
    }
}

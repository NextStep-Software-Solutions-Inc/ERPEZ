using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Transaction.Commands.CreateTransaction;

public class CreateTransactionCommandValidator : AbstractValidator<CreateTransactionCommand>
{
    public CreateTransactionCommandValidator()
    {
        // Required GUIDs
        RuleFor(x => x.FundSourceId)
            .NotEmpty().WithMessage("Fund Source ID is required and must be a valid, non-empty GUID.");

        RuleFor(x => x.OrganizationId)
            .NotEmpty().WithMessage("Organization ID is required and must be a valid, non-empty GUID.");

        RuleFor(x => x.LocationId)
            .NotEmpty().WithMessage("Location ID is required and must be a valid, non-empty GUID.");

        RuleFor(x => x.MFOPAPId)
            .NotEmpty().WithMessage("MFO/PAP ID is required and must be a valid, non-empty GUID.");

        RuleFor(x => x.ObjectId)
            .NotEmpty().WithMessage("Object ID is required and must be a valid, non-empty GUID.");

        // TransactionDate (Required DateTime, Must not be in the future)
        RuleFor(x => x.TransactionDate)
            .NotEmpty().WithMessage("Transaction Date is required.")
            .LessThanOrEqualTo(DateTime.UtcNow.Date) // Prevents future dates
            .WithMessage("Transaction Date cannot be in the future.");

        // AllotedAmount (Required Decimal, Must be Non-Negative)
        RuleFor(x => x.AllotedAmount)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Allotted Amount must be a non-negative number.");

        // ObligatedAmount (Optional Decimal, Non-Negative, Cannot exceed AllotedAmount)
        RuleFor(x => x.ObligatedAmount)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Obligated Amount must be a non-negative number if provided.")
            .LessThanOrEqualTo(x => x.AllotedAmount)
            .WithMessage("Obligated Amount cannot exceed the Allotted Amount.")
            .When(x => x.ObligatedAmount.HasValue);

        // DisbursementAmount (Optional Decimal, Non-Negative, Cannot exceed ObligatedAmount)
        RuleFor(x => x.DisbursementAmount)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Disbursement Amount must be a non-negative number if provided.")
            .LessThanOrEqualTo(x => x.ObligatedAmount.GetValueOrDefault(x.AllotedAmount))
            // Check against ObligatedAmount if present, otherwise AllotedAmount (for safety)
            .WithMessage("Disbursement Amount cannot exceed the Obligated Amount.")
            .When(x => x.DisbursementAmount.HasValue && x.ObligatedAmount.HasValue);
    }
}
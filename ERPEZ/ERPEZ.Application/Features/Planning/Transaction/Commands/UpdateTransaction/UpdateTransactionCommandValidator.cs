using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Transaction.Commands.UpdateTransaction;

public class UpdateTransactionCommandValidator : AbstractValidator<UpdateTransactionCommand>
{
    public UpdateTransactionCommandValidator()
    {
        // 1. Primary ID Validation (Crucial for updates)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Transaction ID is required for update.")
            .Must(id => id != Guid.Empty)
            .WithMessage("Transaction ID must be a valid, non-empty GUID.");

        // Required GUIDs
        RuleFor(x => x.UpdateTransaction.FundSourceId)
            .NotEmpty().WithMessage("Fund Source ID is required and must be a valid, non-empty GUID.");

        RuleFor(x => x.UpdateTransaction.OrganizationId)
            .NotEmpty().WithMessage("Organization ID is required and must be a valid, non-empty GUID.");

        RuleFor(x => x.UpdateTransaction.LocationId)
            .NotEmpty().WithMessage("Location ID is required and must be a valid, non-empty GUID.");

        RuleFor(x => x.UpdateTransaction.MFOPAPId)
            .NotEmpty().WithMessage("MFO/PAP ID is required and must be a valid, non-empty GUID.");

        RuleFor(x => x.UpdateTransaction.ObjectId)
            .NotEmpty().WithMessage("Object ID is required and must be a valid, non-empty GUID.");

        // TransactionDate (Required DateTime, Must not be in the future)
        RuleFor(x => x.UpdateTransaction.TransactionDate)
            .NotEmpty().WithMessage("Transaction Date is required.")
            .LessThanOrEqualTo(DateTime.UtcNow.Date)
            .WithMessage("Transaction Date cannot be in the future.");

        // AllotedAmount (Required Decimal, Must be Non-Negative)
        RuleFor(x => x.UpdateTransaction.AllotedAmount)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Allotted Amount must be a non-negative number.");

        // ObligatedAmount (Optional Decimal, Non-Negative, Cannot exceed AllotedAmount)
        RuleFor(x => x.UpdateTransaction.ObligatedAmount)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Obligated Amount must be a non-negative number if provided.")
            .LessThanOrEqualTo(x => x.UpdateTransaction.AllotedAmount)
            .WithMessage("Obligated Amount cannot exceed the Allotted Amount.")
            .When(x => x.UpdateTransaction.ObligatedAmount.HasValue);

        // DisbursementAmount (Optional Decimal, Non-Negative, Cannot exceed ObligatedAmount)
        RuleFor(x => x.UpdateTransaction.DisbursementAmount)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Disbursement Amount must be a non-negative number if provided.")
            .LessThanOrEqualTo(x => x.UpdateTransaction.ObligatedAmount.GetValueOrDefault(x.UpdateTransaction.AllotedAmount))
            .WithMessage("Disbursement Amount cannot exceed the Obligated Amount.")
            .When(x => x.UpdateTransaction.DisbursementAmount.HasValue && x.UpdateTransaction.ObligatedAmount.HasValue);
    }
}
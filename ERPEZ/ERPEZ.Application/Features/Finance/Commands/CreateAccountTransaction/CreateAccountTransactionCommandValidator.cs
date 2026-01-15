using FluentValidation;

namespace ERPEZ.Application.Features.Finance.Commands.CreateAccountTransaction;

/// <summary>
/// Validator for CreateAccountTransactionCommand ensuring all user input meets business requirements.
/// </summary>
public class CreateAccountTransactionCommandValidator : AbstractValidator<CreateAccountTransactionCommand>
{
    public CreateAccountTransactionCommandValidator()
    {
        RuleFor(x => x.FromAccountId)
            .NotEmpty()
            .WithMessage("Source account is required.");

        RuleFor(x => x.ToAccountId)
            .NotEmpty()
            .WithMessage("Destination account is required.");

        RuleFor(x => x.FromAccountId)
            .NotEqual(x => x.ToAccountId)
            .WithMessage("Source and destination accounts must be different.");

        RuleFor(x => x.Purpose)
            .NotEmpty()
            .WithMessage("Purpose is required.")
            .MinimumLength(10)
            .WithMessage("Purpose must be at least 10 characters.")
            .MaximumLength(1000)
            .WithMessage("Purpose cannot exceed 1000 characters.");

        RuleFor(x => x.AmountTransfer)
            .GreaterThan(0)
            .WithMessage("Transfer amount must be greater than zero.")
            .LessThanOrEqualTo(999999999999.99m)
            .WithMessage("Transfer amount exceeds maximum limit.");

        RuleFor(x => x.Code)
            .GreaterThan(0)
            .WithMessage("Transaction code must be a positive integer.");

        RuleFor(x => x.TransactionDate)
            .NotEmpty()
            .WithMessage("Transaction date is required.");
    }
}

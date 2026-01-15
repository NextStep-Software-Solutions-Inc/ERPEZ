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

        RuleFor(x => x.TransactionDate)
            .NotEmpty()
            .WithMessage("Transaction date is required.")
            .Must(date => IsAtLeast10WorkingDaysFromNow(date))
            .WithMessage("Transaction date must be at least 10 working days from today.");
    }

    private static bool IsAtLeast10WorkingDaysFromNow(DateTime transactionDate)
    {
        var today = DateTime.UtcNow.Date;
        var workingDaysNeeded = 10;
        var workingDaysCount = 0;
        var currentDate = today.AddDays(1);

        while (workingDaysCount < workingDaysNeeded)
        {
            if (currentDate.DayOfWeek != DayOfWeek.Saturday && currentDate.DayOfWeek != DayOfWeek.Sunday)
            {
                workingDaysCount++;
            }

            if (workingDaysCount < workingDaysNeeded)
            {
                currentDate = currentDate.AddDays(1);
            }
        }

        return transactionDate.Date >= currentDate;
    }
}

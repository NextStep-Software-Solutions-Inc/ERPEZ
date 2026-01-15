using FluentValidation;

namespace ERPEZ.Application.Features.Finance.Commands.AuthorizeAccountTransaction;

/// <summary>
/// Validator for AuthorizeAccountTransactionCommand ensuring all user input meets business requirements.
/// </summary>
public class AuthorizeAccountTransactionCommandValidator : AbstractValidator<AuthorizeAccountTransactionCommand>
{
    public AuthorizeAccountTransactionCommandValidator()
    {
        RuleFor(x => x.TransactionId)
            .NotEmpty()
            .WithMessage("Transaction ID is required.");

        RuleFor(x => x.AuthorizationPIN)
            .NotEmpty()
            .WithMessage("Authorization PIN is required.")
            .MinimumLength(4)
            .WithMessage("Authorization PIN must be at least 4 characters.")
            .MaximumLength(50)
            .WithMessage("Authorization PIN cannot exceed 50 characters.");
    }
}

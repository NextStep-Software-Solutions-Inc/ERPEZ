using FluentValidation;

namespace ERPEZ.Application.Features.Core.UserPINs.Commands.CreateUserPIN;

/// <summary>
/// Validator for CreateUserPINCommand ensuring PIN meets security requirements.
/// </summary>
public class CreateUserPINCommandValidator : AbstractValidator<CreateUserPINCommand>
{
    public CreateUserPINCommandValidator()
    {
        RuleFor(x => x.PIN)
            .NotEmpty()
            .WithMessage("PIN is required.")
            .Matches(@"^\d{4,6}$")
            .WithMessage("PIN must be 4-6 digits only.");

        RuleFor(x => x.ExpiresAt)
            .GreaterThan(DateTime.UtcNow)
            .WithMessage("Expiration date must be in the future.")
            .When(x => x.ExpiresAt.HasValue);
    }
}

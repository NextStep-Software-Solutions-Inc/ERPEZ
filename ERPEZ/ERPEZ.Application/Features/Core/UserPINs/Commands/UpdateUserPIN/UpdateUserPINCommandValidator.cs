using FluentValidation;

namespace ERPEZ.Application.Features.Core.UserPINs.Commands.UpdateUserPIN;

/// <summary>
/// Validator for UpdateUserPINCommand ensuring PINs meet security requirements.
/// </summary>
public class UpdateUserPINCommandValidator : AbstractValidator<UpdateUserPINCommand>
{
    public UpdateUserPINCommandValidator()
    {
        RuleFor(x => x.CurrentPIN)
            .NotEmpty()
            .WithMessage("Current PIN is required.")
            .Matches(@"^\d{4,6}$")
            .WithMessage("Current PIN must be 4-6 digits only.");

        RuleFor(x => x.NewPIN)
            .NotEmpty()
            .WithMessage("New PIN is required.")
            .Matches(@"^\d{4,6}$")
            .WithMessage("New PIN must be 4-6 digits only.");

        RuleFor(x => x.NewPIN)
            .NotEqual(x => x.CurrentPIN)
            .WithMessage("New PIN must be different from current PIN.");

        RuleFor(x => x.ExpiresAt)
            .GreaterThan(DateTime.UtcNow)
            .WithMessage("Expiration date must be in the future.")
            .When(x => x.ExpiresAt.HasValue);
    }
}

using FluentValidation;

namespace ERPEZ.Application.Features.Core.UserPINs.Commands.DeleteUserPIN;

/// <summary>
/// Validator for DeleteUserPINCommand ensuring current PIN is provided for verification.
/// </summary>
public class DeleteUserPINCommandValidator : AbstractValidator<DeleteUserPINCommand>
{
    public DeleteUserPINCommandValidator()
    {
        RuleFor(x => x.CurrentPIN)
            .NotEmpty()
            .WithMessage("Current PIN is required for verification.")
            .Matches(@"^\d{4,6}$")
            .WithMessage("Current PIN must be 4-6 digits only.");
    }
}

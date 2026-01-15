using FluentValidation;

namespace ERPEZ.Application.Features.Finance.Commands.DeleteAccount;

/// <summary>
/// Validator for DeleteAccountCommand ensuring the identifier is provided.
/// </summary>
public class DeleteAccountCommandValidator : AbstractValidator<DeleteAccountCommand>
{
    public DeleteAccountCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Account identifier is required.");
    }
}

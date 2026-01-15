using FluentValidation;

namespace ERPEZ.Application.Features.Finance.Commands.UpdateAccount;

/// <summary>
/// Validator for UpdateAccountCommand ensuring a valid identifier and name.
/// </summary>
public class UpdateAccountCommandValidator : AbstractValidator<UpdateAccountCommand>
{
    public UpdateAccountCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Account identifier is required.");

        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Account name is required.")
            .MinimumLength(3)
            .WithMessage("Account name must be at least 3 characters.")
            .MaximumLength(255)
            .WithMessage("Account name cannot exceed 255 characters.");
    }
}

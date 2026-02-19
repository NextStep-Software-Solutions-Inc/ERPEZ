using FluentValidation;

namespace ERPEZ.Application.Features.Planning.User.Commands.DeleteUser;

/// <summary>
/// Validator for DeleteUserCommand ensuring the ID is provided.
/// </summary>
public class DeleteUserCommandValidator : AbstractValidator<DeleteUserCommand>
{
    public DeleteUserCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("User ID is required for deletion.");
    }
}

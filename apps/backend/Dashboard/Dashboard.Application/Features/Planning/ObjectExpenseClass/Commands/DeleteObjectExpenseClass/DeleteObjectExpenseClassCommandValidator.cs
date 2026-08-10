using FluentValidation;

namespace ERPEZ.Application.Features.Planning.ObjectExpenseClass.Commands.DeleteObjectExpenseClass;

/// <summary>
/// Validator for DeleteObjectExpenseClassCommand ensuring the identifier is valid.
/// </summary>
public class DeleteObjectExpenseClassCommandValidator : AbstractValidator<DeleteObjectExpenseClassCommand>
{
    public DeleteObjectExpenseClassCommandValidator()
    {
        RuleFor(command => command.Id)
            .NotEmpty().WithMessage("Object expense class identifier is required.");
    }
}

using FluentValidation;

namespace ERPEZ.Application.Features.Planning.ExpenseClass.Commands.DeleteExpenseClass;

/// <summary>
/// Validator for DeleteExpenseClassCommand ensuring the identifier is valid.
/// </summary>
public class DeleteExpenseClassCommandValidator : AbstractValidator<DeleteExpenseClassCommand>
{
    public DeleteExpenseClassCommandValidator()
    {
        RuleFor(command => command.Id)
            .NotEmpty().WithMessage("Expense class identifier is required.");
    }
}

using FluentValidation;

namespace ERPEZ.Application.Features.Planning.ExpenseClass.Commands.CreateExpenseClass;

/// <summary>
/// Validator for CreateExpenseClassCommand ensuring all required fields meet business requirements.
/// </summary>
public class CreateExpenseClassCommandValidator : AbstractValidator<CreateExpenseClassCommand>
{
    public CreateExpenseClassCommandValidator()
    {
        RuleFor(command => command.Name)
            .NotEmpty().WithMessage("Expense class name is required.")
            .MinimumLength(3).WithMessage("Expense class name must be at least 3 characters.")
            .MaximumLength(200).WithMessage("Expense class name cannot exceed 200 characters.");

        RuleFor(command => command.Code)
            .NotEmpty().WithMessage("Expense class code is required.")
            .MinimumLength(1).WithMessage("Expense class code must be at least 1 character.")
            .MaximumLength(50).WithMessage("Expense class code cannot exceed 50 characters.");

        RuleFor(command => command.Description)
            .MaximumLength(1000).WithMessage("Description cannot exceed 1000 characters.");

        RuleFor(command => command.Type)
            .IsInEnum().WithMessage("Invalid expense class type.");
    }
}

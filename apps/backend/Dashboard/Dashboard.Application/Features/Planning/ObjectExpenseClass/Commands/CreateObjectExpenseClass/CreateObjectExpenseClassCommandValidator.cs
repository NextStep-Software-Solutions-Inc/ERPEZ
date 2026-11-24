using FluentValidation;

namespace ERPEZ.Application.Features.Planning.ObjectExpenseClass.Commands.CreateObjectExpenseClass;

/// <summary>
/// Validator for CreateObjectExpenseClassCommand ensuring all required fields meet business requirements.
/// </summary>
public class CreateObjectExpenseClassCommandValidator : AbstractValidator<CreateObjectExpenseClassCommand>
{
    public CreateObjectExpenseClassCommandValidator()
    {
        RuleFor(command => command.ObjectId)
            .NotEmpty().WithMessage("Object identifier is required.");

        RuleFor(command => command.ExpenseClassId)
            .NotEmpty().WithMessage("Expense class identifier is required.");

        RuleFor(command => command.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MinimumLength(3).WithMessage("Name must be at least 3 characters.")
            .MaximumLength(200).WithMessage("Name cannot exceed 200 characters.");

        RuleFor(command => command.Description)
            .MaximumLength(1000).WithMessage("Description cannot exceed 1000 characters.");
    }
}

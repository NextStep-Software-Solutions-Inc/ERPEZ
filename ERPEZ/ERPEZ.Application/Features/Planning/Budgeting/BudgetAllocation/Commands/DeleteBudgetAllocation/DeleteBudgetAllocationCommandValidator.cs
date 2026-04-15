using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Budgeting.BudgetAllocation.Commands.DeleteBudgetAllocation;

public class DeleteBudgetAllocationCommandValidator : AbstractValidator<DeleteBudgetAllocationCommand>
{
    public DeleteBudgetAllocationCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.");
    }
}

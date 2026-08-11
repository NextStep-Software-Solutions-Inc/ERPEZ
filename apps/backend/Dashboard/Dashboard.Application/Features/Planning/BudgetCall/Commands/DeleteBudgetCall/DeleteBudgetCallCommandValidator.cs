using FluentValidation;

namespace ERPEZ.Application.Features.Planning.BudgetCall.Commands.DeleteBudgetCall;

public class DeleteBudgetCallCommandValidator : AbstractValidator<DeleteBudgetCallCommand>
{
    public DeleteBudgetCallCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Budget call ID is required.");
    }
}

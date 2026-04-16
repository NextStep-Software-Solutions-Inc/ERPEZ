using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Budgeting.LineItemBudgetDetail.Commands.DeleteLineItemBudgetDetail;

public class DeleteLineItemBudgetDetailCommandValidator : AbstractValidator<DeleteLineItemBudgetDetailCommand>
{
    public DeleteLineItemBudgetDetailCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.");
    }
}




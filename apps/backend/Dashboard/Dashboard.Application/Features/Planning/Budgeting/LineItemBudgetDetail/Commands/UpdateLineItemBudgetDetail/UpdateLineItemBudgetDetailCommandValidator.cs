using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Budgeting.LineItemBudgetDetail.Commands.UpdateLineItemBudgetDetail;

public class UpdateLineItemBudgetDetailCommandValidator : AbstractValidator<UpdateLineItemBudgetDetailCommand>
{
    public UpdateLineItemBudgetDetailCommandValidator()
    {
        RuleFor(x => x.Request.LineItemBudgetId)
            .NotEqual(Guid.Empty)
            .WithMessage("{PropertyName} cannot be an empty Guid.")
            .When(x => x.Request.LineItemBudgetId.HasValue);

        RuleFor(x => x.Request.ObjectId)
            .NotEqual(Guid.Empty)
            .WithMessage("{PropertyName} cannot be an empty Guid.")
            .When(x => x.Request.ObjectId.HasValue);

        RuleFor(x => x.Request.Budget)
            .GreaterThanOrEqualTo(0)
            .WithMessage("{PropertyName} must be greater than or equal to 0.")
            .When(x => x.Request.Budget.HasValue);

        RuleFor(x => x.Request.EndDate)
            .GreaterThanOrEqualTo(x => x.Request.StartDate!.Value)
            .WithMessage("{PropertyName} must be greater than or equal to StartDate.")
            .When(x => x.Request.StartDate.HasValue && x.Request.EndDate.HasValue);

        RuleFor(x => x.Request.UnitQuantity)
            .GreaterThan(0)
            .WithMessage("{PropertyName} must be greater than 0.")
            .When(x => x.Request.UnitQuantity.HasValue);

        RuleFor(x => x.Request.UnitCost)
            .GreaterThanOrEqualTo(0)
            .WithMessage("{PropertyName} must be greater than or equal to 0.")
            .When(x => x.Request.UnitCost.HasValue);
    }
}

using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Budgeting.LineItemBudgetDetail.Commands.CreateLineItemBudgetDetail;

public class CreateLineItemBudgetDetailCommandValidator : AbstractValidator<CreateLineItemBudgetDetailCommand>
{
    public CreateLineItemBudgetDetailCommandValidator()
    {
        RuleFor(x => x.Request.LineItemBudgetId)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.");

        // ObjectId is only required when not auto-populating from an expenditure.
        RuleFor(x => x.Request.ObjectId)
            .NotEmpty()
            .WithMessage("{PropertyName} is required when WFPObjectiveActivityExpenditureId is not provided.")
            .When(x => !x.Request.WFPObjectiveActivityExpenditureId.HasValue);

        RuleFor(x => x.Request.Budget)
            .GreaterThanOrEqualTo(0)
            .WithMessage("{PropertyName} must be greater than or equal to 0.");

        RuleFor(x => x.Request.EndDate)
            .GreaterThanOrEqualTo(x => x.Request.StartDate!.Value)
            .WithMessage("{PropertyName} must be greater than or equal to StartDate.")
            .When(x => x.Request.StartDate.HasValue && x.Request.EndDate.HasValue);
    }
}

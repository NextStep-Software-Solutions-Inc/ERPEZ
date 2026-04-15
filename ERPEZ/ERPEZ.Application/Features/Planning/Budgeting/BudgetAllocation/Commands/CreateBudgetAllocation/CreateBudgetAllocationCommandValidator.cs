using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Budgeting.BudgetAllocation.Commands.CreateBudgetAllocation;

public class CreateBudgetAllocationCommandValidator : AbstractValidator<CreateBudgetAllocationCommand>
{
    public CreateBudgetAllocationCommandValidator()
    {
        RuleFor(x => x.Request.LineItemBudgetDetailId)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.");

        RuleFor(x => x.Request.BudgetPeriod)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.")
            .MaximumLength(50)
            .WithMessage("{PropertyName} cannot exceed 50 characters.");

        RuleFor(x => x.Request.TotalAllocated)
            .GreaterThan(0)
            .WithMessage("{PropertyName} must be greater than 0.");

        RuleFor(x => x.Request.EndDate)
            .GreaterThanOrEqualTo(x => x.Request.StartDate)
            .WithMessage("{PropertyName} must be greater than or equal to StartDate.");
    }
}

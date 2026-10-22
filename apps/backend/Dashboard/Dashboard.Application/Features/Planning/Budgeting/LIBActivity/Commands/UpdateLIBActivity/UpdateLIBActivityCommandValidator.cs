using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIBActivity.Commands.UpdateLIBActivity;

public class UpdateLIBActivityCommandValidator : AbstractValidator<UpdateLIBActivityCommand>
{
    public UpdateLIBActivityCommandValidator()
    {
        RuleFor(x => x.Request.LineItemBudgetId)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.");
        RuleFor(x => x.Request.Name)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.")
            .MaximumLength(500)
            .WithMessage("{PropertyName} must not exceed 500 characters.")
            .When(x => !x.Request.WFPObjectiveActivityId.HasValue && !x.Request.OPCRActivityId.HasValue);
    }
}




using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Commands.CreateMarketScoping;

/// <summary>
/// Validator for CreateMarketScopingCommand ensuring all user input meets business requirements.
/// </summary>
public class CreateMarketScopingCommandValidator : AbstractValidator<CreateMarketScopingCommand>
{
    public CreateMarketScopingCommandValidator()
    {
        RuleFor(x => x.Request)
            .NotNull()
            .WithMessage("Request cannot be null.");

        RuleFor(x => x.Request.UserId)
            .NotEmpty()
            .WithMessage("User ID is required.");

        RuleFor(x => x.Request.ProjectName)
            .NotEmpty()
            .WithMessage("Project name is required.")
            .MinimumLength(3)
            .WithMessage("Project name must be at least 3 characters.")
            .MaximumLength(200)
            .WithMessage("Project name cannot exceed 200 characters.");

        RuleFor(x => x.Request.EstimatedBudget)
            .GreaterThan(0)
            .WithMessage("Estimated budget must be greater than zero.");

        RuleFor(x => x.Request.PeriodFrom)
            .NotEmpty()
            .WithMessage("Period from date is required.");

        RuleFor(x => x.Request.PeriodTo)
            .NotEmpty()
            .WithMessage("Period to date is required.")
            .GreaterThan(x => x.Request.PeriodFrom)
            .WithMessage("Period to date must be after period from date.");

        RuleFor(x => x.Request.DeliveryDate)
            .NotEmpty()
            .WithMessage("Delivery date is required.")
            .GreaterThanOrEqualTo(x => x.Request.PeriodTo)
            .WithMessage("Delivery date must be on or after the period to date.");

        RuleFor(x => x.Request.TargetLineItemBudgetActivityId)
            .NotEmpty()
            .WithMessage("Target Line Item Budget Activity ID is required.");

        RuleFor(x => x.Request.ActivitiesConducted)
            .NotNull()
            .WithMessage("Activities conducted list cannot be null.");

        RuleFor(x => x.Request.ParameterEvaluations)
            .NotNull()
            .WithMessage("Parameter evaluations list cannot be null.");
    }
}

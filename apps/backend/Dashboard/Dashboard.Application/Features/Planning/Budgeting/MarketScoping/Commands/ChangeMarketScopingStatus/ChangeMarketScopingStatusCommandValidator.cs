using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Commands.ChangeMarketScopingStatus;

/// <summary>
/// Validator for ChangeMarketScopingStatusCommand ensuring all user input meets business requirements.
/// </summary>
public class ChangeMarketScopingStatusCommandValidator : AbstractValidator<ChangeMarketScopingStatusCommand>
{
    public ChangeMarketScopingStatusCommandValidator()
    {
        RuleFor(x => x.Request)
            .NotNull()
            .WithMessage("Request cannot be null.");

        RuleFor(x => x.Request.MarketScopingId)
            .NotEmpty()
            .WithMessage("Market Scoping ID is required.");

        RuleFor(x => x.Request.Status)
            .NotEmpty()
            .WithMessage("Status is required.")
            .Must(BeValidStatus)
            .WithMessage("Status must be a valid status value (Draft, Submitted, Approved, Returned, Active, or Archived).");

        RuleFor(x => x.Request.ChangeReason)
            .MaximumLength(500)
            .WithMessage("Change reason cannot exceed 500 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Request.ChangeReason));
    }

    private static bool BeValidStatus(string status)
    {
        var validStatuses = new[] { "Draft", "Submitted", "Approved", "Returned", "Active", "Archived" };
        return validStatuses.Contains(status, StringComparer.OrdinalIgnoreCase);
    }
}

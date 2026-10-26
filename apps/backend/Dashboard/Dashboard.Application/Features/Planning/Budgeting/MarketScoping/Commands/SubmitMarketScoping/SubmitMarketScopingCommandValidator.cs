using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Commands.SubmitMarketScoping;

/// <summary>
/// Validator for SubmitMarketScopingCommand.
/// </summary>
public class SubmitMarketScopingCommandValidator : AbstractValidator<SubmitMarketScopingCommand>
{
    public SubmitMarketScopingCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Market Scoping ID is required.");
    }
}

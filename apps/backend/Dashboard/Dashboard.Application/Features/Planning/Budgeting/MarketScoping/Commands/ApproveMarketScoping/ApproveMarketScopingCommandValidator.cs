using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Commands.ApproveMarketScoping;

/// <summary>
/// Validator for ApproveMarketScopingCommand.
/// </summary>
public class ApproveMarketScopingCommandValidator : AbstractValidator<ApproveMarketScopingCommand>
{
    public ApproveMarketScopingCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Market Scoping ID is required.");
    }
}

using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Commands.DeleteMarketScoping;

/// <summary>
/// Validator for DeleteMarketScopingCommand ensuring the ID is valid.
/// </summary>
public class DeleteMarketScopingCommandValidator : AbstractValidator<DeleteMarketScopingCommand>
{
    public DeleteMarketScopingCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Market scoping ID is required.");
    }
}

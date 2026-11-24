using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Commands.ReturnMarketScoping;

/// <summary>
/// Validator for ReturnMarketScopingCommand.
/// </summary>
public class ReturnMarketScopingCommandValidator : AbstractValidator<ReturnMarketScopingCommand>
{
    public ReturnMarketScopingCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Market Scoping ID is required.");

        RuleFor(x => x.Remarks)
            .MaximumLength(500)
            .WithMessage("Remarks cannot exceed 500 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Remarks));
    }
}

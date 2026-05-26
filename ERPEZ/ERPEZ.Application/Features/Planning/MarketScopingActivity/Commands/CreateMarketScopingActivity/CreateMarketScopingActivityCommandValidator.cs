using FluentValidation;

namespace ERPEZ.Application.Features.Planning.MarketScopingActivity.Commands.CreateMarketScopingActivity;

public class CreateMarketScopingActivityCommandValidator : AbstractValidator<CreateMarketScopingActivityCommand>
{
    public CreateMarketScopingActivityCommandValidator()
    {
        RuleFor(x => x.MarketScopingId)
            .NotEmpty()
            .WithMessage("Market Scoping ID is required.");

        RuleFor(x => x.ActivitySettingsId)
            .NotEmpty()
            .WithMessage("Activity Settings ID is required.");
    }
}

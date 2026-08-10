using FluentValidation;

namespace ERPEZ.Application.Features.Planning.MarketScopingActivitySettings.Commands.DeleteMarketScopingActivitySettings;

public class DeleteMarketScopingActivitySettingsCommandValidator : AbstractValidator<DeleteMarketScopingActivitySettingsCommand>
{
    public DeleteMarketScopingActivitySettingsCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Market scoping activity settings ID is required for deletion.");
    }
}

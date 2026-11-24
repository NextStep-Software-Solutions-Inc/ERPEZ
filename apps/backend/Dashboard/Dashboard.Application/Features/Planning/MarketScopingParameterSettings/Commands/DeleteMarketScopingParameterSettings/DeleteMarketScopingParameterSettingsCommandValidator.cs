using FluentValidation;

namespace ERPEZ.Application.Features.Planning.MarketScopingParameterSettings.Commands.DeleteMarketScopingParameterSettings;

public class DeleteMarketScopingParameterSettingsCommandValidator : AbstractValidator<DeleteMarketScopingParameterSettingsCommand>
{
    public DeleteMarketScopingParameterSettingsCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Market scoping parameter settings ID is required for deletion.");
    }
}

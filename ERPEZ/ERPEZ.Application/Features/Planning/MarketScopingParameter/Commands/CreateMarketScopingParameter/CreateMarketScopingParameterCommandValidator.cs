using FluentValidation;

namespace ERPEZ.Application.Features.Planning.MarketScopingParameter.Commands.CreateMarketScopingParameter;

public class CreateMarketScopingParameterCommandValidator : AbstractValidator<CreateMarketScopingParameterCommand>
{
    public CreateMarketScopingParameterCommandValidator()
    {
        RuleFor(x => x.MarketScopingId)
            .NotEmpty()
            .WithMessage("Market Scoping ID is required.");

        RuleFor(x => x.ParameterSettingsId)
            .NotEmpty()
            .WithMessage("Parameter Settings ID is required.");

        RuleFor(x => x.Remarks)
            .MaximumLength(1000)
            .WithMessage("Remarks cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Remarks));
    }
}

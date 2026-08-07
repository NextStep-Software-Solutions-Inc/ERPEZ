using FluentValidation;

namespace ERPEZ.Application.Features.Planning.MarketScopingParameterSettings.Commands.CreateMarketScopingParameterSettings;

public class CreateMarketScopingParameterSettingsCommandValidator : AbstractValidator<CreateMarketScopingParameterSettingsCommand>
{
    public CreateMarketScopingParameterSettingsCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Parameter name is required.")
            .MaximumLength(500)
            .WithMessage("Parameter name cannot exceed 500 characters.");

        RuleFor(x => x.GuidedQuestion)
            .NotEmpty()
            .WithMessage("Guided question is required.")
            .MaximumLength(1000)
            .WithMessage("Guided question cannot exceed 1000 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(1000)
            .WithMessage("Description cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Description));

        RuleFor(x => x.SortOrder)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Sort order must be greater than or equal to 0.");
    }
}

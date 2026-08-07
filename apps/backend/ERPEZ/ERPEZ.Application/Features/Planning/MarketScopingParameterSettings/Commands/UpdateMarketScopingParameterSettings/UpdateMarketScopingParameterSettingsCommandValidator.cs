using FluentValidation;

namespace ERPEZ.Application.Features.Planning.MarketScopingParameterSettings.Commands.UpdateMarketScopingParameterSettings;

public class UpdateMarketScopingParameterSettingsCommandValidator : AbstractValidator<UpdateMarketScopingParameterSettingsCommand>
{
    public UpdateMarketScopingParameterSettingsCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Parameter Settings ID is required.");

        RuleFor(x => x.UpdateData.Name)
            .NotEmpty()
            .WithMessage("Parameter name is required.")
            .MaximumLength(500)
            .WithMessage("Parameter name cannot exceed 500 characters.");

        RuleFor(x => x.UpdateData.GuidedQuestion)
            .NotEmpty()
            .WithMessage("Guided question is required.")
            .MaximumLength(1000)
            .WithMessage("Guided question cannot exceed 1000 characters.");

        RuleFor(x => x.UpdateData.Description)
            .MaximumLength(1000)
            .WithMessage("Description cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.UpdateData.Description));

        RuleFor(x => x.UpdateData.SortOrder)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Sort order must be greater than or equal to 0.");
    }
}

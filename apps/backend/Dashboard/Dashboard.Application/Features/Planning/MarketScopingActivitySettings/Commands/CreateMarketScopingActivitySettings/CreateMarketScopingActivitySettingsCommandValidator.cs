using FluentValidation;

namespace ERPEZ.Application.Features.Planning.MarketScopingActivitySettings.Commands.CreateMarketScopingActivitySettings;

public class CreateMarketScopingActivitySettingsCommandValidator : AbstractValidator<CreateMarketScopingActivitySettingsCommand>
{
    public CreateMarketScopingActivitySettingsCommandValidator()
    {
        RuleFor(x => x.ActivityType)
            .NotEmpty()
            .WithMessage("Activity type is required.")
            .MaximumLength(500)
            .WithMessage("Activity type cannot exceed 500 characters.");

        RuleFor(x => x.Label)
            .NotEmpty()
            .WithMessage("Activity label is required.")
            .MaximumLength(500)
            .WithMessage("Activity label cannot exceed 500 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(1000)
            .WithMessage("Description cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Description));

        RuleFor(x => x.SortOrder)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Sort order must be greater than or equal to 0.");
    }
}

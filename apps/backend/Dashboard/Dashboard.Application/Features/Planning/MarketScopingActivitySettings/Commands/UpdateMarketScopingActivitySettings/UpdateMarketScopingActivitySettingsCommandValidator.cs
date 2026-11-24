using FluentValidation;

namespace ERPEZ.Application.Features.Planning.MarketScopingActivitySettings.Commands.UpdateMarketScopingActivitySettings;

public class UpdateMarketScopingActivitySettingsCommandValidator : AbstractValidator<UpdateMarketScopingActivitySettingsCommand>
{
    public UpdateMarketScopingActivitySettingsCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Activity Settings ID is required.");

        RuleFor(x => x.UpdateData.ActivityType)
            .NotEmpty()
            .WithMessage("Activity type is required.")
            .MaximumLength(500)
            .WithMessage("Activity type cannot exceed 500 characters.");

        RuleFor(x => x.UpdateData.Label)
            .NotEmpty()
            .WithMessage("Activity label is required.")
            .MaximumLength(500)
            .WithMessage("Activity label cannot exceed 500 characters.");

        RuleFor(x => x.UpdateData.Description)
            .MaximumLength(1000)
            .WithMessage("Description cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.UpdateData.Description));

        RuleFor(x => x.UpdateData.SortOrder)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Sort order must be greater than or equal to 0.");
    }
}

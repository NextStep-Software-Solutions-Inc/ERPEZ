using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Commands.CreateMarketScopingActivity;

/// <summary>
/// Validator for CreateMarketScopingActivityCommand ensuring all user input meets business requirements.
/// </summary>
public class CreateMarketScopingActivityCommandValidator : AbstractValidator<CreateMarketScopingActivityCommand>
{
    public CreateMarketScopingActivityCommandValidator()
    {
        RuleFor(x => x.Request)
            .NotNull()
            .WithMessage("Request cannot be null.");

        RuleFor(x => x.Request.MarketScopingId)
            .NotEmpty()
            .WithMessage("Market Scoping ID is required.");

        RuleFor(x => x.Request.ActivitySettingsId)
            .NotEmpty()
            .WithMessage("Activity Settings ID is required.");

        RuleFor(x => x.Request.ActivityId)
            .NotEmpty()
            .WithMessage("Activity ID is required.");

        RuleFor(x => x.Request.Attachments)
            .NotNull()
            .WithMessage("Attachments list cannot be null.");

        RuleForEach(x => x.Request.Attachments)
            .ChildRules(attachment =>
            {
                attachment.RuleFor(a => a.FileUrl)
                    .NotEmpty()
                    .WithMessage("File URL is required for attachments.")
                    .MaximumLength(500)
                    .WithMessage("File URL cannot exceed 500 characters.");

                attachment.RuleFor(a => a.FileName)
                    .NotEmpty()
                    .WithMessage("File name is required for attachments.")
                    .MaximumLength(255)
                    .WithMessage("File name cannot exceed 255 characters.");
            });
    }
}

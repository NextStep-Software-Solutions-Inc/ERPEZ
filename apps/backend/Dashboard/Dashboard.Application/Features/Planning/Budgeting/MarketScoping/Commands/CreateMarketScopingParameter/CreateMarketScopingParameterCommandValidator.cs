using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Budgeting.MarketScoping.Commands.CreateMarketScopingParameter;

/// <summary>
/// Validator for CreateMarketScopingParameterCommand ensuring all user input meets business requirements.
/// </summary>
public class CreateMarketScopingParameterCommandValidator : AbstractValidator<CreateMarketScopingParameterCommand>
{
    public CreateMarketScopingParameterCommandValidator()
    {
        RuleFor(x => x.Request)
            .NotNull()
            .WithMessage("Request cannot be null.");

        RuleFor(x => x.Request.MarketScopingId)
            .NotEmpty()
            .WithMessage("Market Scoping ID is required.");

        RuleFor(x => x.Request.ParameterSettingsId)
            .NotEmpty()
            .WithMessage("Parameter Settings ID is required.");

        RuleFor(x => x.Request.ParameterId)
            .NotEmpty()
            .WithMessage("Parameter ID is required.");

        RuleFor(x => x.Request.Remarks)
            .MaximumLength(1000)
            .WithMessage("Remarks cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Request.Remarks));

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

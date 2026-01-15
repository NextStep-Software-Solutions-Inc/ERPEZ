using FluentValidation;

namespace ERPEZ.Application.Features.Finance.Commands.CreateAccount;

/// <summary>
/// Validator for CreateAccountCommand ensuring all required fields are provided.
/// </summary>
public class CreateAccountCommandValidator : AbstractValidator<CreateAccountCommand>
{
    public CreateAccountCommandValidator()
    {
        RuleFor(x => x.OfficeId)
            .NotEmpty()
            .WithMessage("Office is required.");

        RuleFor(x => x.FiscalYearId)
            .NotEmpty()
            .WithMessage("Fiscal year is required.");

        RuleFor(x => x.FundSourceId)
            .Must(id => id != Guid.Empty)
            .When(x => x.FundSourceId.HasValue)
            .WithMessage("Fund source identifier must be a valid value when provided.");

        RuleFor(x => x.Name)
            .Cascade(CascadeMode.Stop)
            .MinimumLength(3)
            .When(x => !string.IsNullOrWhiteSpace(x.Name))
            .WithMessage("Account name must be at least 3 characters.")
            .MaximumLength(255)
            .When(x => !string.IsNullOrWhiteSpace(x.Name))
            .WithMessage("Account name cannot exceed 255 characters.");

        RuleFor(x => x)
            .Must(x => !string.IsNullOrWhiteSpace(x.Name) || x.FundSourceId.HasValue)
            .WithMessage("Provide an account name or a fund source so the name can be derived.");
    }
}

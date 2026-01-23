using FluentValidation;

namespace ERPEZ.Application.Features.Planning.UACSCodeCombinationFiscalYear.Commands.CreateUACSCodeCombinationFiscalYear;

/// <summary>
/// Validator for CreateUACSCodeCombinationFiscalYearCommand ensuring all user input meets business requirements.
/// </summary>
public class CreateUACSCodeCombinationFiscalYearCommandValidator : AbstractValidator<CreateUACSCodeCombinationFiscalYearCommand>
{
    public CreateUACSCodeCombinationFiscalYearCommandValidator()
    {
        RuleFor(x => x.UACSCodeCombinationId)
            .NotEmpty()
            .WithMessage("UACS code combination ID is required.");

        RuleFor(x => x.FiscalYearId)
            .NotEmpty()
            .WithMessage("Fiscal year ID is required.");

        RuleFor(x => x.IsValidFrom)
            .NotEmpty()
            .WithMessage("Valid from date is required.");

        RuleFor(x => x.IsValidTo)
            .GreaterThan(x => x.IsValidFrom)
            .WithMessage("Valid to date must be after valid from date.")
            .When(x => x.IsValidTo.HasValue);
    }
}

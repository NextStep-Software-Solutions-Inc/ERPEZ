using FluentValidation;

namespace ERPEZ.Application.Features.Planning.UACSCodeCombinationFiscalYear.Commands.UpdateUACSCodeCombinationFiscalYear;

/// <summary>
/// Validator for UpdateUACSCodeCombinationFiscalYearCommand ensuring all user input meets business requirements.
/// </summary>
public class UpdateUACSCodeCombinationFiscalYearCommandValidator : AbstractValidator<UpdateUACSCodeCombinationFiscalYearCommand>
{
    public UpdateUACSCodeCombinationFiscalYearCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("ID is required.");

        RuleFor(x => x.UpdateUACSCodeCombinationFiscalYear.UACSCodeCombinationId)
            .NotEmpty()
            .WithMessage("UACS code combination ID is required.");

        RuleFor(x => x.UpdateUACSCodeCombinationFiscalYear.FiscalYearId)
            .NotEmpty()
            .WithMessage("Fiscal year ID is required.");

        RuleFor(x => x.UpdateUACSCodeCombinationFiscalYear.IsValidFrom)
            .NotEmpty()
            .WithMessage("Valid from date is required.");

        RuleFor(x => x.UpdateUACSCodeCombinationFiscalYear.IsValidTo)
            .GreaterThan(x => x.UpdateUACSCodeCombinationFiscalYear.IsValidFrom)
            .WithMessage("Valid to date must be after valid from date.")
            .When(x => x.UpdateUACSCodeCombinationFiscalYear.IsValidTo.HasValue);
    }
}

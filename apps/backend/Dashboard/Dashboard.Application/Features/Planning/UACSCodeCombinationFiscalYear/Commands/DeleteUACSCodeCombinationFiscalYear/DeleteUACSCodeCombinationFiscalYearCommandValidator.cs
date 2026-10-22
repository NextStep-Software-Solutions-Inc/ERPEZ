using FluentValidation;

namespace ERPEZ.Application.Features.Planning.UACSCodeCombinationFiscalYear.Commands.DeleteUACSCodeCombinationFiscalYear;

/// <summary>
/// Validator for DeleteUACSCodeCombinationFiscalYearCommand ensuring all user input meets business requirements.
/// </summary>
public class DeleteUACSCodeCombinationFiscalYearCommandValidator : AbstractValidator<DeleteUACSCodeCombinationFiscalYearCommand>
{
    public DeleteUACSCodeCombinationFiscalYearCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("ID is required.");
    }
}

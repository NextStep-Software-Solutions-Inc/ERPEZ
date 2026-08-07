using FluentValidation;

namespace ERPEZ.Application.Features.Planning.UACSCodeSegmentFiscalYear.Commands.DeleteUACSCodeSegmentFiscalYear;

/// <summary>
/// Validator for DeleteUACSCodeSegmentFiscalYearCommand ensuring all user input meets business requirements.
/// </summary>
public class DeleteUACSCodeSegmentFiscalYearCommandValidator : AbstractValidator<DeleteUACSCodeSegmentFiscalYearCommand>
{
    public DeleteUACSCodeSegmentFiscalYearCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("ID is required.");
    }
}

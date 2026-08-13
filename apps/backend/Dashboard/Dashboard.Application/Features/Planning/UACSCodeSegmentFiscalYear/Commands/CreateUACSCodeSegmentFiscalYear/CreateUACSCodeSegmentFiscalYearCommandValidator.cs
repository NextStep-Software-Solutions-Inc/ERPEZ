using FluentValidation;

namespace ERPEZ.Application.Features.Planning.UACSCodeSegmentFiscalYear.Commands.CreateUACSCodeSegmentFiscalYear;

/// <summary>
/// Validator for CreateUACSCodeSegmentFiscalYearCommand ensuring all user input meets business requirements.
/// </summary>
public class CreateUACSCodeSegmentFiscalYearCommandValidator : AbstractValidator<CreateUACSCodeSegmentFiscalYearCommand>
{
    public CreateUACSCodeSegmentFiscalYearCommandValidator()
    {
        RuleFor(x => x.UACSCodeSegmentId)
            .NotEmpty()
            .WithMessage("UACS code segment ID is required.");

        RuleFor(x => x.FiscalYearId)
            .NotEmpty()
            .WithMessage("Fiscal year ID is required.");

        RuleFor(x => x.EffectiveStartDate)
            .NotEmpty()
            .WithMessage("Effective start date is required.");

        RuleFor(x => x.EffectiveEndDate)
            .GreaterThan(x => x.EffectiveStartDate)
            .WithMessage("Effective end date must be after effective start date.")
            .When(x => x.EffectiveEndDate.HasValue);
    }
}

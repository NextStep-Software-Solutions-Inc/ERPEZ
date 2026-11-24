using FluentValidation;

namespace ERPEZ.Application.Features.Planning.UACSCodeSegmentFiscalYear.Commands.UpdateUACSCodeSegmentFiscalYear;

/// <summary>
/// Validator for UpdateUACSCodeSegmentFiscalYearCommand ensuring all user input meets business requirements.
/// </summary>
public class UpdateUACSCodeSegmentFiscalYearCommandValidator : AbstractValidator<UpdateUACSCodeSegmentFiscalYearCommand>
{
    public UpdateUACSCodeSegmentFiscalYearCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("ID is required.");

        RuleFor(x => x.UpdateUACSCodeSegmentFiscalYear.UACSCodeSegmentId)
            .NotEmpty()
            .WithMessage("UACS code segment ID is required.");

        RuleFor(x => x.UpdateUACSCodeSegmentFiscalYear.FiscalYearId)
            .NotEmpty()
            .WithMessage("Fiscal year ID is required.");

        RuleFor(x => x.UpdateUACSCodeSegmentFiscalYear.EffectiveStartDate)
            .NotEmpty()
            .WithMessage("Effective start date is required.");

        RuleFor(x => x.UpdateUACSCodeSegmentFiscalYear.EffectiveEndDate)
            .GreaterThan(x => x.UpdateUACSCodeSegmentFiscalYear.EffectiveStartDate)
            .WithMessage("Effective end date must be after effective start date.")
            .When(x => x.UpdateUACSCodeSegmentFiscalYear.EffectiveEndDate.HasValue);
    }
}

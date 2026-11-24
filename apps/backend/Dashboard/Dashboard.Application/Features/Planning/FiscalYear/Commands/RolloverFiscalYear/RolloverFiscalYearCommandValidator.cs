using FluentValidation;

namespace ERPEZ.Application.Features.Planning.FiscalYear.Commands.RolloverFiscalYear;

public class RolloverFiscalYearCommandValidator : AbstractValidator<RolloverFiscalYearCommand>
{
    public RolloverFiscalYearCommandValidator()
    {
        RuleFor(x => x.SourceFiscalYearId)
            .NotEmpty()
            .WithMessage("Source Fiscal Year is required.");

        RuleFor(x => x.TargetFiscalYearId)
            .NotEmpty()
            .WithMessage("Target Fiscal Year is required.")
            .NotEqual(x => x.SourceFiscalYearId)
            .WithMessage("Target Fiscal Year must differ from the Source Fiscal Year.");

        RuleFor(x => x)
            .Must(x => x.IncludeOrgStructure || x.IncludeUACSLibrary || x.IncludeRecurringExpenses)
            .WithMessage("At least one data category (Org Structure, UACS Library, Recurring Expenses) must be selected for rollover.");
    }
}

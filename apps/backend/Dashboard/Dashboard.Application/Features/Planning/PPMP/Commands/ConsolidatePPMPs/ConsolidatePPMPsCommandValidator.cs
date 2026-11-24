using FluentValidation;

namespace ERPEZ.Application.Features.Planning.PPMP.Commands.ConsolidatePPMPs;

public class ConsolidatePPMPsCommandValidator : AbstractValidator<ConsolidatePPMPsCommand>
{
    public ConsolidatePPMPsCommandValidator()
    {
        RuleFor(x => x.ChildPPMPIds)
            .NotEmpty()
            .WithMessage("At least one child PPMP ID is required for consolidation.");

        RuleFor(x => x.ParentOfficeId)
            .NotEmpty()
            .WithMessage("Parent Office ID is required.");

        RuleFor(x => x.FiscalYearId)
            .NotEmpty()
            .WithMessage("Fiscal Year ID is required.");

        RuleFor(x => x.ConsolidatedPPMPNumber)
            .NotEmpty()
            .WithMessage("Consolidated PPMP Number is required.")
            .MaximumLength(50)
            .WithMessage("Consolidated PPMP Number cannot exceed 50 characters.");
    }
}

using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Document.Commands.GeneratePPMP;

public class GeneratePpmpDocumentCommandValidator : AbstractValidator<GeneratePpmpDocumentCommand>
{
    public GeneratePpmpDocumentCommandValidator()
    {
        RuleFor(x => x.AgencyId)
            .NotEmpty()
            .WithMessage("Agency is required.");

        RuleFor(x => x.FiscalYear)
            .NotEmpty()
            .WithMessage("Fiscal Year must be a 4-digit year (e.g. 2025).");

        RuleFor(x => x.PpmpNumber)
            .NotEmpty()
            .WithMessage("PPMP Number is required.");

        RuleFor(x => x.EndUserOrImplementingUnit)
            .NotEmpty()
            .WithMessage("End-User or Implementing Unit is required.");

        RuleFor(x => x.Items)
            .NotEmpty()
            .WithMessage("PPMP must have at least one line item.");

        RuleFor(x => x.Signatories)
            .Must(s => s.Count >= 2)
            .WithMessage("PPMP requires at least 2 signatories (Prepared by, Submitted by).");
    }
}
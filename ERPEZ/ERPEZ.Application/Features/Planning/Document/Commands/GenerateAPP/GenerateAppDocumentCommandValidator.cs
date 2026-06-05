using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Document.Commands.GenerateAPP;

public class GenerateAppDocumentCommandValidator : AbstractValidator<GenerateAppDocumentCommand>
{
    public GenerateAppDocumentCommandValidator()
    {
        RuleFor(x => x.AgencyId).NotEmpty().WithMessage("Agency is required.");

        RuleFor(x => x.FiscalYear)
            .NotEmpty()
            .WithMessage("Fiscal Year is required.");

        RuleFor(x => x.Signatories)
            .Must(s => s.Count >= 3)
            .WithMessage("APP requires 3 signatories: Prepared by, Recommended by, Approved by.");
    }
}
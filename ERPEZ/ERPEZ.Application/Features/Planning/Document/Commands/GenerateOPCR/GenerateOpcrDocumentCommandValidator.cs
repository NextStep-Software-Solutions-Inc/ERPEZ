using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Document.Commands.GenerateOPCR;

public class GenerateOpcrDocumentCommandValidator : AbstractValidator<GenerateOpcrDocumentCommand>
{
    public GenerateOpcrDocumentCommandValidator()
    {
        RuleFor(x => x.OfficeId)
            .NotEmpty()
            .WithMessage("Office is required.");

        RuleFor(x => x.FiscalYear)
            .NotEmpty()
            .Matches(@"^\d{4}$")
            .WithMessage("Fiscal Year must be a 4-digit year.");

        RuleFor(x => x.Unit)
            .NotEmpty()
            .WithMessage("Unit is required.");

        RuleFor(x => x.Functions)
            .NotEmpty()
            .WithMessage("OPCR must have at least one function.");

        RuleFor(x => x.Signatories)
            .Must(s => s.Count >= 2)
            .WithMessage("At least 2 signatories required.");
    }
}
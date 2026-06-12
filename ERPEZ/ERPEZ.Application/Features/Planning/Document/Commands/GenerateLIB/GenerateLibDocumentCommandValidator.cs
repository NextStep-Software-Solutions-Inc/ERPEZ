using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Document.Commands.GenerateLIB;

public class GenerateLibDocumentCommandValidator : AbstractValidator<GenerateLibDocumentCommand>
{
    public GenerateLibDocumentCommandValidator()
    {
        RuleFor(x => x.OfficeId)
            .NotEmpty()
            .WithMessage("Office is required.");

        RuleFor(x => x.FiscalYear)
            .NotEmpty()
            .Matches(@"^\d{4}$")
            .WithMessage("Fiscal Year must be a 4-digit year.");

        RuleFor(x => x.LibNumber)
            .NotEmpty()
            .WithMessage("LIB Number is required.");

        RuleFor(x => x.ProgramTitle)
            .NotEmpty()
            .WithMessage("Program Title is required.");

        RuleFor(x => x.ImplementingUnit)
            .NotEmpty()
            .WithMessage("Implementing Unit is required.");

        RuleFor(x => x.LineItems)
            .NotEmpty()
            .WithMessage("LIB must have at least one line item.");

        RuleFor(x => x.Signatories)
            .Must(s => s.Count >= 2)
            .WithMessage("LIB requires at least 2 signatories.");
    }
}
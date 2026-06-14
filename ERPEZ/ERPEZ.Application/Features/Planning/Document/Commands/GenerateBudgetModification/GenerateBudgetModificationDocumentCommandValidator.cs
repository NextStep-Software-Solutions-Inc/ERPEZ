using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Document.Commands.GenerateBudgetModification;

public class GenerateBudgetModificationDocumentCommandValidator
    : AbstractValidator<GenerateBudgetModificationDocumentCommand>
{
    public GenerateBudgetModificationDocumentCommandValidator()
    {
        RuleFor(x => x.OfficeId)
            .NotEmpty()
            .WithMessage("Office is required.");

        RuleFor(x => x.FiscalYear)
            .NotEmpty()
            .Matches(@"^\d{4}$")
            .WithMessage("Fiscal Year must be a 4-digit year.");

        RuleFor(x => x.ModificationNumber)
            .NotEmpty()
            .WithMessage("Modification Number is required.");

        RuleFor(x => x.Purpose)
            .NotEmpty()
            .WithMessage("Purpose is required.");

        RuleFor(x => x.FromItems)
            .NotEmpty()
            .WithMessage("Budget Modification must have at least one FROM item.");

        RuleFor(x => x.ToItems)
            .NotEmpty()
            .WithMessage("Budget Modification must have at least one TO item.");

        RuleFor(x => x.Signatories)
            .Must(s => s.Count >= 2)
            .WithMessage("At least 2 signatories required.");
    }
}
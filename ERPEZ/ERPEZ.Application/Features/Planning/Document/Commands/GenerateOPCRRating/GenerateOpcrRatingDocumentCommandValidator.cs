using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Document.Commands.GenerateOPCRRating;

public class GenerateOpcrRatingDocumentCommandValidator : AbstractValidator<GenerateOpcrRatingDocumentCommand>
{
    public GenerateOpcrRatingDocumentCommandValidator()
    {
        RuleFor(x => x.AgencyId)
            .NotEmpty()
            .WithMessage("Agency is required.");

        RuleFor(x => x.FiscalYear)
            .NotEmpty().Matches(@"^\d{4}$").WithMessage("Fiscal Year must be a 4-digit year.");

        RuleFor(x => x.Unit)
            .NotEmpty()
            .WithMessage("Unit is required.");

        RuleFor(x => x.Period)
            .NotEmpty()
            .WithMessage("Rating period is required.");

        RuleFor(x => x.Items)
            .NotEmpty()
            .WithMessage("OPCR Rating must have at least one item.");
            
        RuleFor(x => x.Signatories)
            .Must(s => s.Count >= 2)
            .WithMessage("At least 2 signatories required.");
    }
}
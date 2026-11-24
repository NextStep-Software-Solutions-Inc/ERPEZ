using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.RequestForQuotation.Commands.GenerateRFQDocument;

public class GenerateRFQDocumentCommandValidator : AbstractValidator<GenerateRFQDocumentCommand>
{
    public GenerateRFQDocumentCommandValidator()
    {
        RuleFor(x => x.RFQId)
            .NotEmpty()
            .WithMessage("RFQId is required.");

        RuleFor(x => x.Format)
            .IsInEnum()
            .WithMessage("A valid ExportFormat must be specified.");
    }
}

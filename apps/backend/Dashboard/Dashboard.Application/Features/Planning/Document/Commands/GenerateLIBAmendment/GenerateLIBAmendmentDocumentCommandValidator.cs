using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Document.Commands.GenerateLIBAmendment;

public class GenerateLIBAmendmentDocumentCommandValidator : AbstractValidator<GenerateLIBAmendmentDocumentCommand>
{
    public GenerateLIBAmendmentDocumentCommandValidator()
    {
        RuleFor(x => x.AmendmentRequestId)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.");

        RuleFor(x => x.Format)
            .IsInEnum()
            .WithMessage("{PropertyName} must be a valid export format.");

        RuleFor(x => x.GeneratedBy)
            .NotEmpty()
            .WithMessage("{PropertyName} is required.");
    }
}

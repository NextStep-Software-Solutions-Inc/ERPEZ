using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Document.Commands.GenerateLIB;

public class GenerateLibDocumentCommandValidator : AbstractValidator<GenerateLibDocumentCommand>
{
    public GenerateLibDocumentCommandValidator()
    {
        RuleFor(x => x.LibId)
            .NotEmpty()
            .WithMessage("Line Item Budget identifier is required.");

        RuleFor(x => x.Format)
            .IsInEnum()
            .WithMessage("Export format must be a valid value.");
    }
}
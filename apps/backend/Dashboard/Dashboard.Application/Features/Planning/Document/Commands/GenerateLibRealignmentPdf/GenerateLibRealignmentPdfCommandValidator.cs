using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Document.Commands.GenerateLibRealignmentPdf;

public class GenerateLibRealignmentPdfCommandValidator : AbstractValidator<GenerateLibRealignmentPdfCommand>
{
    public GenerateLibRealignmentPdfCommandValidator()
    {
        RuleFor(x => x.RealignmentId)
            .NotEmpty()
            .WithMessage("Realignment ID is required.");
    }
}

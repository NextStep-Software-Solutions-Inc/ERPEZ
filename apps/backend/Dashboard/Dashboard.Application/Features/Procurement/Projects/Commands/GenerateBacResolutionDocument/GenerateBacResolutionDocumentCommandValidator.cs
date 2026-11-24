using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.Projects.Commands.GenerateBacResolutionDocument;

public class GenerateBacResolutionDocumentCommandValidator : AbstractValidator<GenerateBacResolutionDocumentCommand>
{
    public GenerateBacResolutionDocumentCommandValidator()
    {
        RuleFor(x => x.BacResolutionId)
            .NotEmpty()
            .WithMessage("BacResolutionId is required.");

        RuleFor(x => x.Format)
            .IsInEnum()
            .WithMessage("A valid ExportFormat must be specified.");
    }
}

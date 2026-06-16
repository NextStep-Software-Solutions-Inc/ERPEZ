using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Document.Commands.GenerateAPP;

public class GenerateAppDocumentCommandValidator : AbstractValidator<GenerateAppDocumentCommand>
{
    public GenerateAppDocumentCommandValidator()
    {
        RuleFor(x => x.AppId)
            .NotEmpty()
            .WithMessage("AppId is required.");
    }
}
using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.AOBs.Commands.GenerateAOBDocument;

public class GenerateAOBDocumentCommandValidator : AbstractValidator<GenerateAOBDocumentCommand>
{
    public GenerateAOBDocumentCommandValidator()
    {
        RuleFor(x => x.AOBId)
            .NotEmpty().WithMessage("AOB ID is required.");
    }
}

using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.MasterDocumentType.Commands.CreateMasterDocumentType;

public class CreateMasterDocumentTypeCommandValidator
    : AbstractValidator<CreateMasterDocumentTypeCommand>
{
    public CreateMasterDocumentTypeCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Document name is required.")
            .MaximumLength(256).WithMessage("Name cannot exceed 256 characters.");

        RuleFor(x => x.EnvelopeType)
            .InclusiveBetween(1, 2)
            .WithMessage("EnvelopeType must be 1 (Technical) or 2 (Financial).");

        When(x => !string.IsNullOrWhiteSpace(x.Description), () =>
            RuleFor(x => x.Description)
                .MaximumLength(1000).WithMessage("Description cannot exceed 1000 characters."));
    }
}
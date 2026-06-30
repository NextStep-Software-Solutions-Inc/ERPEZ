using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.MasterDocumentType.Commands.UpdateMasterDocumentType;

public class UpdateMasterDocumentTypeCommandValidator
    : AbstractValidator<UpdateMasterDocumentTypeCommand>
{
    public UpdateMasterDocumentTypeCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("Document type ID is required.");
        RuleFor(x => x.Name).NotEmpty().MaximumLength(256);
        RuleFor(x => x.EnvelopeType).InclusiveBetween(1, 2)
            .WithMessage("EnvelopeType must be 1 (Technical) or 2 (Financial).");
    }
}
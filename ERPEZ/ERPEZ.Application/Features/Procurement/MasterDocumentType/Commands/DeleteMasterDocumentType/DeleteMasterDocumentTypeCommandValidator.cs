using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.MasterDocumentType.Commands.DeleteMasterDocumentType;

public class DeleteMasterDocumentTypeCommandValidator : AbstractValidator<DeleteMasterDocumentTypeCommand>
{
    public DeleteMasterDocumentTypeCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Master document type ID is required for deletion.")
            .Must(id => id != Guid.Empty)
            .WithMessage("Master document type ID must be a valid, non-empty GUID.");
    }
}
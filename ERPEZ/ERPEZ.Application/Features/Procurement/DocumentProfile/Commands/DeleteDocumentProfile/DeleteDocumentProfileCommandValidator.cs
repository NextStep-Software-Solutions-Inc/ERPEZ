using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.DocumentProfile.Commands.DeleteDocumentProfile;

public class DeleteDocumentProfileCommandValidator : AbstractValidator<DeleteDocumentProfileCommand>
{
    public DeleteDocumentProfileCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Document profile ID is required for deletion.")
            .Must(id => id != Guid.Empty)
            .WithMessage("Document profile ID must be a valid, non-empty GUID.");
    }
}
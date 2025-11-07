using FluentValidation;

namespace ERPEZ.Application.Features.Planning.OPCR.Commands.DeleteOPCR;

public class DeleteOPCRCommandValidator : AbstractValidator<DeleteOPCRCommand>
{
    public DeleteOPCRCommandValidator()
    {
        // Primary ID Validation (Required for deletion)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("OPCR ID is required for deletion.")
            .Must(id => id != Guid.Empty)
            .WithMessage("OPCR ID must be a valid, non-empty GUID.");
    }
}

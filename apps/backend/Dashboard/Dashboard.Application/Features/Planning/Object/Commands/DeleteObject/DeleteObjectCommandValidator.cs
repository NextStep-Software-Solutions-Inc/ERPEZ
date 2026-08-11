using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Object.Commands.DeleteObject;

public class DeleteObjectCommandValidator : AbstractValidator<DeleteObjectCommand>
{
    public DeleteObjectCommandValidator()
    {
        // Primary ID Validation (Required for deletion)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Object ID is required for deletion.")
            .Must(id => id != Guid.Empty)
            .WithMessage("Object ID must be a valid, non-empty GUID.");
    }
}

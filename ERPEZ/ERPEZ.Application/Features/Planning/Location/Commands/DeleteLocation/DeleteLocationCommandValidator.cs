using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Location.Commands.DeleteLocation;

public class DeleteLocationCommandValidator : AbstractValidator<DeleteLocationCommand>
{
    public DeleteLocationCommandValidator()
    {
        // Primary ID Validation (Required for deletion)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Location ID is required for deletion.")
            .Must(id => id != Guid.Empty)
            .WithMessage("Location ID must be a valid, non-empty GUID.");
    }
}
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Object.Commands.UpdateObject;

public class UpdateObjectCommandValidator : AbstractValidator<UpdateObjectCommand>
{
    public UpdateObjectCommandValidator()
    {
        // Primary ID Validation (Crucial for updates)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Object ID is required for update.")
            .Must(id => id != Guid.Empty)
            .WithMessage("Object ID must be a valid, non-empty GUID.");

        // Name (Optional String)
        RuleFor(x => x.UpdateObject.Name)
            .MinimumLength(3)
            .WithMessage("Name must be at least 3 characters long.")
            .MaximumLength(100)
            .WithMessage("Name cannot exceed 100 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.UpdateObject.Name));

        // Code (Optional String)
        RuleFor(x => x.UpdateObject.Code)
            .MinimumLength(2)
            .WithMessage("Code must be at least 2 characters long.")
            .MaximumLength(20)
            .WithMessage("Code cannot exceed 20 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.UpdateObject.Code));

        // IsActive (Optional Bool?) - No validation needed for non-nullable bool
    }
}

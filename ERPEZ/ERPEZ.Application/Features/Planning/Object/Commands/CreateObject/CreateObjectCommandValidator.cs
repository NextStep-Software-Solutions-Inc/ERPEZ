using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Object.Commands.CreateObject;

public class CreateObjectCommandValidator : AbstractValidator<CreateObjectCommand>
{
    public CreateObjectCommandValidator()
    {
        RuleFor(x => x.ParentId)
            .Must(id => id != Guid.Empty)
            .WithMessage("Parent ID must be a valid, non-empty GUID if provided.")
            .When(x => x.ParentId.HasValue);

        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Name is required.")
            .MinimumLength(3)
            .WithMessage("Name must be at least 3 characters long.")
            .MaximumLength(100)
            .WithMessage("Name cannot exceed 100 characters.");

        RuleFor(x => x.Code)
            .NotEmpty()
            .WithMessage("Code is required.")
            .MinimumLength(2)
            .WithMessage("Code must be at least 2 characters long.")
            .MaximumLength(20)
            .WithMessage("Code cannot exceed 20 characters.");
    }
}
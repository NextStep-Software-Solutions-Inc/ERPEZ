using FluentValidation;

namespace ERPEZ.Application.Features.Planning.ObjectChildCode.Commands.CreateObjectChildCode;

/// <summary>
/// Validator for CreateObjectChildCodeCommand ensuring all input meets requirements.
/// </summary>
public class CreateObjectChildCodeCommandValidator : AbstractValidator<CreateObjectChildCodeCommand>
{
    public CreateObjectChildCodeCommandValidator()
    {
        RuleFor(x => x.ParentObjectId)
            .NotEmpty()
            .WithMessage("Parent Object ID is required.");

        RuleFor(x => x.ChildObjectId)
            .NotEmpty()
            .WithMessage("Child Object ID is required.");

        RuleFor(x => x.ParentObjectId)
            .NotEqual(x => x.ChildObjectId)
            .WithMessage("Parent and Child Object IDs must be different.");

        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Name is required.")
            .MinimumLength(3)
            .WithMessage("Name must be at least 3 characters.")
            .MaximumLength(150)
            .WithMessage("Name cannot exceed 150 characters.");

        RuleFor(x => x.Code)
            .NotEmpty()
            .WithMessage("Code is required.")
            .MinimumLength(1)
            .WithMessage("Code must be at least 1 character.")
            .MaximumLength(50)
            .WithMessage("Code cannot exceed 50 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(500)
            .WithMessage("Description cannot exceed 500 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Description));
    }
}

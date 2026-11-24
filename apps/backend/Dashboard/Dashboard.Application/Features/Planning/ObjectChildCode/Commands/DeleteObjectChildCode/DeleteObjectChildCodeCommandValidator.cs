using FluentValidation;

namespace ERPEZ.Application.Features.Planning.ObjectChildCode.Commands.DeleteObjectChildCode;

/// <summary>
/// Validator for DeleteObjectChildCodeCommand ensuring ID is valid.
/// </summary>
public class DeleteObjectChildCodeCommandValidator : AbstractValidator<DeleteObjectChildCodeCommand>
{
    public DeleteObjectChildCodeCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Object child code ID is required.");
    }
}

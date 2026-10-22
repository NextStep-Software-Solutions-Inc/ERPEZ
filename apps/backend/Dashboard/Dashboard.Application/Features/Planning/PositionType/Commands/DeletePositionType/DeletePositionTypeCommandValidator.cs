using FluentValidation;

namespace ERPEZ.Application.Features.Planning.PositionType.Commands.DeletePositionType;

/// <summary>
/// Validator for DeletePositionTypeCommand ensuring the ID is provided.
/// </summary>
public class DeletePositionTypeCommandValidator : AbstractValidator<DeletePositionTypeCommand>
{
    public DeletePositionTypeCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Position type ID is required for deletion.");
    }
}

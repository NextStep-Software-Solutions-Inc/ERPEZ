using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Position.Commands.DeletePosition;

/// <summary>
/// Validator for DeletePositionCommand ensuring the ID is provided.
/// </summary>
public class DeletePositionCommandValidator : AbstractValidator<DeletePositionCommand>
{
    public DeletePositionCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Position ID is required for deletion.");
    }
}

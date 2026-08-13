using FluentValidation;

namespace ERPEZ.Application.Features.Planning.PersonnelPosition.Commands.DeletePersonnelPosition;

/// <summary>
/// Validator for DeletePersonnelPositionCommand ensuring the ID is provided.
/// </summary>
public class DeletePersonnelPositionCommandValidator : AbstractValidator<DeletePersonnelPositionCommand>
{
    public DeletePersonnelPositionCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Personnel position ID is required for deletion.");
    }
}

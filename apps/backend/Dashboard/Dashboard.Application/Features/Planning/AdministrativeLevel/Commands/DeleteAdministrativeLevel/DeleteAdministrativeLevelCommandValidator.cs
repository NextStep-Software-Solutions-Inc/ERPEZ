using FluentValidation;

namespace ERPEZ.Application.Features.Planning.AdministrativeLevel.Commands.DeleteAdministrativeLevel;

/// <summary>
/// Validator for DeleteAdministrativeLevelCommand ensuring the ID is provided.
/// </summary>
public class DeleteAdministrativeLevelCommandValidator : AbstractValidator<DeleteAdministrativeLevelCommand>
{
    public DeleteAdministrativeLevelCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Administrative level ID is required for deletion.");
    }
}

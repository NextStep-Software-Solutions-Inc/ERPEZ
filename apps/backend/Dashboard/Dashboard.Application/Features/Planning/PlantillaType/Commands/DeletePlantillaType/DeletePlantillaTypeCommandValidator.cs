using FluentValidation;

namespace ERPEZ.Application.Features.Planning.PlantillaType.Commands.DeletePlantillaType;

/// <summary>
/// Validator for DeletePlantillaTypeCommand ensuring the ID is provided.
/// </summary>
public class DeletePlantillaTypeCommandValidator : AbstractValidator<DeletePlantillaTypeCommand>
{
    public DeletePlantillaTypeCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Plantilla type ID is required for deletion.");
    }
}

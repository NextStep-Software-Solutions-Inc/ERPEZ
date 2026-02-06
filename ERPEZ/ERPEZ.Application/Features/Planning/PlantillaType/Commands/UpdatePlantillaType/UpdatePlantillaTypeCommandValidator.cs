using FluentValidation;

namespace ERPEZ.Application.Features.Planning.PlantillaType.Commands.UpdatePlantillaType;

public class UpdatePlantillaTypeCommandValidator : AbstractValidator<UpdatePlantillaTypeCommand>
{
    public UpdatePlantillaTypeCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Id is required.");

        RuleFor(x => x.UpdatePlantillaType.Name)
            .MaximumLength(200)
            .WithMessage("Name cannot exceed 200 characters.")
            .When(x => !string.IsNullOrEmpty(x.UpdatePlantillaType.Name));

        RuleFor(x => x.UpdatePlantillaType.Code)
            .MaximumLength(50)
            .WithMessage("Code cannot exceed 50 characters.")
            .When(x => !string.IsNullOrEmpty(x.UpdatePlantillaType.Code));

        RuleFor(x => x.UpdatePlantillaType.Benefits)
            .MaximumLength(2000)
            .WithMessage("Benefits cannot exceed 2000 characters.")
            .When(x => !string.IsNullOrEmpty(x.UpdatePlantillaType.Benefits));
    }
}


using FluentValidation;

namespace ERPEZ.Application.Features.Planning.PlantillaType.Commands.CreatePlantillaType;

public class CreatePlantillaTypeCommandValidator : AbstractValidator<CreatePlantillaTypeCommand>
{
    public CreatePlantillaTypeCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Name is required.")
            .MaximumLength(200)
            .WithMessage("Name cannot exceed 200 characters.");

        RuleFor(x => x.Code)
            .NotEmpty()
            .WithMessage("Code is required.")
            .MaximumLength(50)
            .WithMessage("Code cannot exceed 50 characters.");

        RuleFor(x => x.Benefits)
            .MaximumLength(2000)
            .WithMessage("Benefits cannot exceed 2000 characters.")
            .When(x => !string.IsNullOrEmpty(x.Benefits));

        RuleFor(x => x.Duration)
            .GreaterThan(0)
            .WithMessage("Duration must be a positive integer.")
            .When(x => x.Duration.HasValue);
    }
}

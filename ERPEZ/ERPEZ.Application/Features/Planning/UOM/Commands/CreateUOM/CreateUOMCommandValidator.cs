using FluentValidation;

namespace ERPEZ.Application.Features.Planning.UOM.Commands.CreateUOM;

public class CreateUOMCommandValidator : AbstractValidator<CreateUOMCommand>
{
    public CreateUOMCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Name is required.")
            .MaximumLength(100)
            .WithMessage("Name cannot exceed 100 characters.");

        RuleFor(x => x.Code)
            .NotEmpty()
            .WithMessage("Code is required.")
            .MaximumLength(50)
            .WithMessage("Code cannot exceed 50 characters.");

        RuleFor(x => x.ConversionFactor)
            .GreaterThan(0)
            .WithMessage("Conversion factor must be greater than 0.")
            .When(x => x.ConversionFactor.HasValue);
    }
}

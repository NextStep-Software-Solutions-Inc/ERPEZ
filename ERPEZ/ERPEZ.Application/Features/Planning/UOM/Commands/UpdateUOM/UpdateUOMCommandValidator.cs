using FluentValidation;

namespace ERPEZ.Application.Features.Planning.UOM.Commands.UpdateUOM;

public class UpdateUOMCommandValidator : AbstractValidator<UpdateUOMCommand>
{
    public UpdateUOMCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Id is required.");

        RuleFor(x => x.Name)
            .MaximumLength(100)
            .WithMessage("Name cannot exceed 100 characters.")
            .When(x => !string.IsNullOrEmpty(x.Name));

        RuleFor(x => x.Code)
            .MaximumLength(50)
            .WithMessage("Code cannot exceed 50 characters.")
            .When(x => !string.IsNullOrEmpty(x.Code));

        RuleFor(x => x.ConversionFactor)
            .GreaterThan(0)
            .WithMessage("Conversion factor must be greater than 0.")
            .When(x => x.ConversionFactor.HasValue);
    }
}

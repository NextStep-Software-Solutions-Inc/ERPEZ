using ERPEZ.Domain.Enums;
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.KPIMeasurement.Commands.CreateKPIMeasurement;

public class CreateKPIMeasurementCommandValidator : AbstractValidator<CreateKPIMeasurementCommand>
{
    public CreateKPIMeasurementCommandValidator()
    {
        RuleFor(x => x.KPIId)
            .NotEmpty()
            .WithMessage("KPIId is required.");

        RuleFor(x => x.Dimension)
            .NotEmpty()
            .WithMessage("Dimension is required.")
            .Must(BeValidDimension)
            .WithMessage("Dimension must be one of: Quantity, Quality, Timeliness");

        RuleFor(x => x.MOVs)
            .NotNull()
            .WithMessage("MOVs cannot be null.");
    }

    private bool BeValidDimension(string dimension)
    {
        return Enum.TryParse<DimensionEnum>(dimension, true, out _);
    }
}

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

        RuleFor(x => x.Measurements)
            .NotNull()
            .WithMessage("Measurements cannot be null.");

        RuleForEach(x => x.Measurements).ChildRules(m =>
        {
            m.RuleFor(x => x.Name)
                .NotEmpty()
                .WithMessage("Measurement name is required.");

            m.RuleFor(x => x.Dimensions)
                .NotNull()
                .WithMessage("Dimensions cannot be null.")
                .Must(d => d.Count > 0)
                .WithMessage("At least one dimension is required.");

            m.RuleForEach(x => x.Dimensions)
                .IsInEnum()
                .WithMessage("Dimension must be one of: Efficiency, Quality, Timeliness.");

            m.RuleFor(x => x.MOVs)
                .NotNull()
                .WithMessage("MOVs cannot be null.");
        });
    }
}
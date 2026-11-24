using ERPEZ.Domain.Enums;
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.KPIMeasurement.Commands.UpdateKPIMeasurement;

public class UpdateKPIMeasurementCommandValidator : AbstractValidator<UpdateKPIMeasurementCommand>
{
    public UpdateKPIMeasurementCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("KPI Measurement ID is required.");

        RuleFor(x => x.UpdateKPIMeasurement)
            .NotNull()
            .WithMessage("Update data is required.");

        RuleFor(x => x.UpdateKPIMeasurement.RatingScaleTemplateId)
            .Must(id => id!.Value != Guid.Empty)
            .WithMessage("Rating Scale Template ID must be a valid GUID.")
            .When(x => x.UpdateKPIMeasurement.RatingScaleTemplateId.HasValue);

        RuleFor(x => x.UpdateKPIMeasurement.Dimensions)
            .Must(dimensions => dimensions == null || dimensions.Count > 0)
            .WithMessage("At least one dimension is required when dimensions are provided.");

        RuleForEach(x => x.UpdateKPIMeasurement.Dimensions)
            .IsInEnum()
            .WithMessage("Dimension must be one of: Efficiency, Quality, Timeliness.")
            .When(x => x.UpdateKPIMeasurement.Dimensions != null);
    }
}

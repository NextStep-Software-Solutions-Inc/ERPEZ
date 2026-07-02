using ERPEZ.Domain.Enums;
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.FYActiveKPIMeasurement.Commands.UpdateFYActiveKPIMeasurement;

public class UpdateFYActiveKPIMeasurementCommandValidator : AbstractValidator<UpdateFYActiveKPIMeasurementCommand>
{
    public UpdateFYActiveKPIMeasurementCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("FY Active KPI Measurement ID is required.");

        RuleFor(x => x.UpdateFYActiveKPIMeasurement)
            .NotNull()
            .WithMessage("Update data is required.");

        RuleFor(x => x.UpdateFYActiveKPIMeasurement.RatingScaleTemplateId)
            .Must(id => id!.Value != Guid.Empty)
            .WithMessage("Rating Scale Template ID must be a valid GUID.")
            .When(x => x.UpdateFYActiveKPIMeasurement.RatingScaleTemplateId.HasValue);

        RuleFor(x => x.UpdateFYActiveKPIMeasurement.Dimensions)
            .Must(dimensions => dimensions == null || dimensions.Count > 0)
            .WithMessage("At least one dimension is required when dimensions are provided.");

        RuleForEach(x => x.UpdateFYActiveKPIMeasurement.Dimensions)
            .IsInEnum()
            .WithMessage("Dimension must be one of: Efficiency, Quality, Timeliness.")
            .When(x => x.UpdateFYActiveKPIMeasurement.Dimensions != null);
    }
}

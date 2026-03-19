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
    }
}

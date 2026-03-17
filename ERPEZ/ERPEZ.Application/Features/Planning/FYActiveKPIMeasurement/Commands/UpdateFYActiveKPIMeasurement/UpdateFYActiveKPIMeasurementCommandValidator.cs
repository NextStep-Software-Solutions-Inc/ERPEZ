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
    }
}

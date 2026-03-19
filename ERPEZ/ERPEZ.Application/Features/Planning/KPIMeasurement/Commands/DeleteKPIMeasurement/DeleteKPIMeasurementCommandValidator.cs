using FluentValidation;

namespace ERPEZ.Application.Features.Planning.KPIMeasurement.Commands.DeleteKPIMeasurement;

public class DeleteKPIMeasurementCommandValidator : AbstractValidator<DeleteKPIMeasurementCommand>
{
    public DeleteKPIMeasurementCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("KPI Measurement ID is required.");
    }
}

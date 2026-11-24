using FluentValidation;

namespace ERPEZ.Application.Features.Planning.KPIPerformanceMeasure.Commands.UpdateKPIPerformanceMeasure;

/// <summary>
/// Validator for UpdateKPIPerformanceMeasureCommand ensuring all user input meets business requirements.
/// </summary>
public class UpdateKPIPerformanceMeasureCommandValidator : AbstractValidator<UpdateKPIPerformanceMeasureCommand>
{
    public UpdateKPIPerformanceMeasureCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("KPI Performance Measure ID is required.");

        RuleFor(x => x.Dto)
            .NotNull()
            .WithMessage("Update data is required.");
    }
}

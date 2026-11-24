using FluentValidation;

namespace ERPEZ.Application.Features.Planning.KPIPerformanceMeasure.Commands.CreateKPIPerformanceMeasure;

/// <summary>
/// Validator for CreateKPIPerformanceMeasureCommand ensuring all user input meets business requirements.
/// </summary>
public class CreateKPIPerformanceMeasureCommandValidator : AbstractValidator<CreateKPIPerformanceMeasureCommand>
{
    public CreateKPIPerformanceMeasureCommandValidator()
    {
        RuleFor(x => x.KPIId)
            .NotEmpty()
            .WithMessage("KPI ID is required.");

        RuleFor(x => x.PerformanceMeasureId)
            .NotEmpty()
            .WithMessage("Performance Measure ID is required.");
    }
}

using FluentValidation;

namespace ERPEZ.Application.Features.Planning.KPIPerformanceMeasure.Commands.DeleteKPIPerformanceMeasure;

/// <summary>
/// Validator for DeleteKPIPerformanceMeasureCommand.
/// Note: This is a soft-delete operation that validates the entity ID exists.
/// </summary>
public class DeleteKPIPerformanceMeasureCommandValidator : AbstractValidator<DeleteKPIPerformanceMeasureCommand>
{
    public DeleteKPIPerformanceMeasureCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("KPI Performance Measure ID is required for deletion.");
    }
}

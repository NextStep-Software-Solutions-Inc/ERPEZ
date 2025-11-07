using FluentValidation;

namespace ERPEZ.Application.Features.Planning.PerformanceMeasure.Commands.DeletePM;

public class DeletePerformanceMeasureCommandValidator : AbstractValidator<DeletePerformanceMeasureCommand>
{
    public DeletePerformanceMeasureCommandValidator()
    {
        // Primary ID Validation (Required for deletion)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Performance Measure ID is required for deletion.")
            .Must(id => id != Guid.Empty)
            .WithMessage("Performance Measure ID must be a valid, non-empty GUID.");
    }
}
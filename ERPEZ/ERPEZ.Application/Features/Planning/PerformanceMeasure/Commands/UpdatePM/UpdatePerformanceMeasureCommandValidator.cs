using FluentValidation;

namespace ERPEZ.Application.Features.Planning.PerformanceMeasure.Commands.UpdatePM;

public class UpdatePerformanceMeasureCommandValidator : AbstractValidator<UpdatePerformanceMeasureCommand>
{
    public UpdatePerformanceMeasureCommandValidator()
    {
        // 1. Primary ID Validation (Crucial for updates)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Performance Measure ID is required for update.")
            .Must(id => id != Guid.Empty)
            .WithMessage("Performance Measure ID must be a valid, non-empty GUID.");

        // 2. Name (Required String, Min/Max Length)
        RuleFor(x => x.UpdatePerformanceMeasure.Name)
            .NotEmpty()
            .WithMessage("Performance Measure Name is required.")
            .MinimumLength(3)
            .WithMessage("Performance Measure Name must be at least 3 characters long.")
            .MaximumLength(150)
            .WithMessage("Performance Measure Name cannot exceed 150 characters.");

        // 3. Description (Optional String, Max Length)
        RuleFor(x => x.UpdatePerformanceMeasure.Description)
            .MaximumLength(500)
            .WithMessage("Description cannot exceed 500 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.UpdatePerformanceMeasure.Description));
    }
}
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.PerformanceMeasure.Commands.CreatePM;

public class CreatePerformanceMeasureCommandValidator : AbstractValidator<CreatePerformanceMeasureCommand>
{
    public CreatePerformanceMeasureCommandValidator()
    {
        // Name (Required String, Min/Max Length)
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Performance Measure Name is required.")
            .MinimumLength(3)
            .WithMessage("Performance Measure Name must be at least 3 characters long.")
            .MaximumLength(150)
            .WithMessage("Performance Measure Name cannot exceed 150 characters.");

        // Description (Optional String, Max Length)
        RuleFor(x => x.Description)
            .MaximumLength(500)
            .WithMessage("Description cannot exceed 500 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Description));
    }
}

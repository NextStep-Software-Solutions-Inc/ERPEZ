using FluentValidation;

namespace ERPEZ.Application.Features.Planning.UACSCodeSegment.Commands.CreateUACSCodeSegment;

/// <summary>
/// Validator for CreateUACSCodeSegmentCommand ensuring all user input meets business requirements.
/// </summary>
public class CreateUACSCodeSegmentCommandValidator : AbstractValidator<CreateUACSCodeSegmentCommand>
{
    public CreateUACSCodeSegmentCommandValidator()
    {
        RuleFor(x => x.SegmentType)
            .IsInEnum()
            .WithMessage("Segment type must be a valid UACS segment type.");

        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Code segment name is required.")
            .MinimumLength(3)
            .WithMessage("Code segment name must be at least 3 characters.")
            .MaximumLength(200)
            .WithMessage("Code segment name cannot exceed 200 characters.");

        RuleFor(x => x.Description)
            .NotEmpty()
            .WithMessage("Description is required.")
            .MinimumLength(10)
            .WithMessage("Description must be at least 10 characters.")
            .MaximumLength(1000)
            .WithMessage("Description cannot exceed 1000 characters.");

        RuleFor(x => x.DisplayOrder)
            .GreaterThan(0)
            .WithMessage("Display order must be greater than zero.")
            .LessThanOrEqualTo(100)
            .WithMessage("Display order cannot exceed 100.");

        RuleFor(x => x.MaxLength)
            .GreaterThan(0)
            .WithMessage("Maximum length must be greater than zero.")
            .LessThanOrEqualTo(50)
            .WithMessage("Maximum length cannot exceed 50.");

        RuleFor(x => x.Pattern)
            .NotEmpty()
            .WithMessage("Validation pattern is required.")
            .MaximumLength(500)
            .WithMessage("Pattern cannot exceed 500 characters.");
    }
}

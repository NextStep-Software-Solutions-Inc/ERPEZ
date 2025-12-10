using FluentValidation;

namespace ERPEZ.Application.Features.Planning.WFPObjective.Commands.CreateWFPObjective;

/// <summary>
/// Validator for CreateWFPObjectiveCommand ensuring all user input meets business requirements.
/// </summary>
public class CreateWFPObjectiveCommandValidator : AbstractValidator<CreateWFPObjectiveCommand>
{
    public CreateWFPObjectiveCommandValidator()
    {
        // WFPId (Required GUID)
        RuleFor(x => x.WFPId)
            .NotEmpty()
            .WithMessage("Work and Financial Plan ID is required and must be a valid, non-empty GUID.");

        // Description (Required String, Min/Max Length)
        RuleFor(x => x.Description)
            .NotEmpty()
            .WithMessage("Description is required.")
            .MinimumLength(10)
            .WithMessage("Description must be at least 10 characters long.")
            .MaximumLength(1000)
            .WithMessage("Description cannot exceed 1000 characters.");

        // Weight (Required, Must be between 0 and 100)
        RuleFor(x => x.Weight)
            .InclusiveBetween(0.01m, 100m)
            .WithMessage("Weight must be between 0.01% and 100%.");

        // Outcome (Optional, Max Length when provided)
        RuleFor(x => x.Outcome)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Outcome must be a non-negative value.")
            .When(x => x.Outcome.HasValue);
    }
}

using FluentValidation;

namespace ERPEZ.Application.Features.Planning.WFPObjective.Commands.UpdateWFPObjective;

/// <summary>
/// Validator for UpdateWFPObjectiveCommand ensuring all user input meets business requirements.
/// </summary>
public class UpdateWFPObjectiveCommandValidator : AbstractValidator<UpdateWFPObjectiveCommand>
{
    public UpdateWFPObjectiveCommandValidator()
    {
        // Primary ID Validation (Crucial for updates)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Work and Financial Plan Objective ID is required for update.")
            .Must(id => id != Guid.Empty)
            .WithMessage("Work and Financial Plan Objective ID must be a valid, non-empty GUID.");

        // Description (Optional String, Min/Max Length)
        RuleFor(x => x.UpdateWFPObjective.Description)
            .MinimumLength(10)
            .WithMessage("Description must be at least 10 characters long.")
            .MaximumLength(1000)
            .WithMessage("Description cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.UpdateWFPObjective.Description));

        // Weight (Optional, Must be between 0 and 100)
        RuleFor(x => x.UpdateWFPObjective.Weight)
            .InclusiveBetween(0.01m, 100m)
            .WithMessage("Weight must be between 0.01% and 100%.")
            .When(x => x.UpdateWFPObjective.Weight.HasValue);

        // Outcome (Optional, Non-negative)
        RuleFor(x => x.UpdateWFPObjective.Outcome)
            .MaximumLength(500)
            .WithMessage("Outcome must be a non-negative value.")
            .When(x => !string.IsNullOrWhiteSpace(x.UpdateWFPObjective.Outcome));
    }
}

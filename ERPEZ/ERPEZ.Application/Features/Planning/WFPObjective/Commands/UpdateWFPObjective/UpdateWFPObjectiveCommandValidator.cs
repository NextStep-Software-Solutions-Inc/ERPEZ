using FluentValidation;

namespace ERPEZ.Application.Features.Planning.WFPObjective.Commands.UpdateWFPObjective;

public class UpdateWFPObjectiveCommandValidator : AbstractValidator<UpdateWFPObjectiveCommand>
{
    public UpdateWFPObjectiveCommandValidator()
    {
        // Primary ID Validation (Crucial for updates)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("WFP Objective ID is required for update.")
            .Must(id => id != Guid.Empty)
            .WithMessage("WFP Objective ID must be a valid, non-empty GUID.");

        // Description (Optional String, Min/Max Length)
        RuleFor(x => x.UpdateWFPObjective.Description)
            .MinimumLength(10)
            .WithMessage("Description must be at least 10 characters long.")
            .MaximumLength(1000)
            .WithMessage("Description cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.UpdateWFPObjective.Description));
    }
}

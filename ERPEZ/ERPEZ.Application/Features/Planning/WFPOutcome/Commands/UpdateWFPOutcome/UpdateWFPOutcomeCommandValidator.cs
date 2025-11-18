using FluentValidation;

namespace ERPEZ.Application.Features.Planning.WFPOutcome.Commands.UpdateWFPOutcome;

internal class UpdateWFPOutcomeCommandValidator : AbstractValidator<UpdateWFPOutcomeCommand>
{
    public UpdateWFPOutcomeCommandValidator()
    {
        // Primary ID Validation (Crucial for updates)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("WFP Outcome ID is required for update.")
            .Must(id => id != Guid.Empty)
            .WithMessage("WFP Outcome ID must be a valid, non-empty GUID.");

        // Description (Optional String, Min/Max Length)
        RuleFor(x => x.UpdateWFPOutcome.Description)
            .MinimumLength(10)
            .WithMessage("Description must be at least 10 characters long.")
            .MaximumLength(1000)
            .WithMessage("Description cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.UpdateWFPOutcome.Description));
    }
}

using FluentValidation;

namespace ERPEZ.Application.Features.Planning.WFPOutcome.Commands.DeleteWFPOutcome;

internal class DeleteWFPOutcomeCommandValidator : AbstractValidator<DeleteWFPOutcomeCommand>
{
    public DeleteWFPOutcomeCommandValidator()
    {
        // Primary ID Validation (Required for deletion)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("WFP Outcome ID is required for deletion.")
            .Must(id => id != Guid.Empty)
            .WithMessage("WFP Outcome ID must be a valid, non-empty GUID.");
    }
}

using FluentValidation;

namespace ERPEZ.Application.Features.Planning.WFPObjective.Commands.DeleteWFPObjective;

public class DeleteWFPObjectiveCommandValidator : AbstractValidator<DeleteWFPObjectiveCommand>
{
    public DeleteWFPObjectiveCommandValidator()
    {
        // Primary ID Validation (Required for deletion)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("WFP Objective ID is required for deletion.")
            .Must(id => id != Guid.Empty)
            .WithMessage("WFP Objective ID must be a valid, non-empty GUID.");
    }
}

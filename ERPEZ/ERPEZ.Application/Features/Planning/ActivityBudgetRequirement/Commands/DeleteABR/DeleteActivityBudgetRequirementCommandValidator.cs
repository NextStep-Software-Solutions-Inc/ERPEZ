using FluentValidation;

namespace ERPEZ.Application.Features.Planning.ActivityBudgetRequirement.Commands.DeleteABR;

public class DeleteActivityBudgetRequirementCommandValidator : AbstractValidator<DeleteActivityBudgetRequirementCommand>
{
    public DeleteActivityBudgetRequirementCommandValidator()
    {
        // Id (Required Primary Key)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Activity Budget Requirement ID is required for deletion.")
            .Must(id => id != Guid.Empty)
            .WithMessage("Activity Budget Requirement ID must be a valid, non-empty GUID.");
    }
}

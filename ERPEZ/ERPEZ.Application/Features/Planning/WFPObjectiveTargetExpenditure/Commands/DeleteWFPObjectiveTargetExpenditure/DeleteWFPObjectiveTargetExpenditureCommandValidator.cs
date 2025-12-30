using FluentValidation;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTargetExpenditure.Commands.DeleteWFPObjectiveTargetExpenditure;

public class DeleteWFPObjectiveTargetExpenditureCommandValidator : AbstractValidator<DeleteWFPObjectiveTargetExpenditureCommand>
{
    public DeleteWFPObjectiveTargetExpenditureCommandValidator()
    {
        // Id (Required Primary Key)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("WFP Objective Target Activity ID is required for deletion.")
            .Must(id => id != Guid.Empty)
            .WithMessage("WFP Objective Target Activity ID must be a valid, non-empty GUID.");
    }
}

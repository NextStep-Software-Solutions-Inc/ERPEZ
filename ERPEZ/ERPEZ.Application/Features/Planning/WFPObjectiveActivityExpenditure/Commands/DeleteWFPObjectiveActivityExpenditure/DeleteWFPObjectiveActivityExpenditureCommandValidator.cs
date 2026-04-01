using FluentValidation;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveActivityExpenditure.Commands.DeleteWFPObjectiveActivityExpenditure;

public class DeleteWFPObjectiveActivityExpenditureCommandValidator : AbstractValidator<DeleteWFPObjectiveActivityExpenditureCommand>
{
    public DeleteWFPObjectiveActivityExpenditureCommandValidator()
    {
        // Id (Required Primary Key)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("WFP Objective Target Activity ID is required for deletion.")
            .Must(id => id != Guid.Empty)
            .WithMessage("WFP Objective Target Activity ID must be a valid, non-empty GUID.");
    }
}

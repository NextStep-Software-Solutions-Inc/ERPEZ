using ERPEZ.Application.Features.Planning.WFPObjectiveTarget.Commands.UpdateWFPObjectiveTarget;
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.WFPObjectiveTarget.Commands.DeleteWFPObjectiveTarget;

public class DeleteWFPObjectiveTargetCommandValidator : AbstractValidator<UpdateWFPObjectiveTargetCommand>
{
    public DeleteWFPObjectiveTargetCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Objective Target ID is required for deleting the record.");
    }
}

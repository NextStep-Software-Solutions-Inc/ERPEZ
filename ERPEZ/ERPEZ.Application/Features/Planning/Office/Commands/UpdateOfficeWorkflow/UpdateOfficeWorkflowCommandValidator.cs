using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Office.Commands.UpdateOfficeWorkflow;

public class UpdateOfficeWorkflowCommandValidator : AbstractValidator<UpdateOfficeWorkflowCommand>
{
    public UpdateOfficeWorkflowCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Office ID is required.");

        RuleFor(x => x.ProcurementWorkflowId)
            .NotEmpty()
            .WithMessage("Procurement Workflow ID is required.")
            .When(x => x.ProcurementWorkflowId.HasValue);
    }
}

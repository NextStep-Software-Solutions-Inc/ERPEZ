using FluentValidation;

namespace ERPEZ.Application.Features.Planning.ProcurementWorkflow.Commands.UpdateProcurementWorkflow;

public class UpdateProcurementWorkflowCommandValidator : AbstractValidator<UpdateProcurementWorkflowCommand>
{
    public UpdateProcurementWorkflowCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Id is required.");

        RuleFor(x => x.UpdateProcurementWorkflow.Name)
            .MaximumLength(200)
            .WithMessage("Name cannot exceed 200 characters.")
            .When(x => x.UpdateProcurementWorkflow.Name != null);

        RuleFor(x => x.UpdateProcurementWorkflow.Code)
            .MaximumLength(50)
            .WithMessage("Code cannot exceed 50 characters.")
            .When(x => x.UpdateProcurementWorkflow.Code != null);

        RuleFor(x => x.UpdateProcurementWorkflow.ApprovalLevel)
            .GreaterThan(0)
            .WithMessage("Approval Level must be greater than 0.")
            .When(x => x.UpdateProcurementWorkflow.ApprovalLevel.HasValue);
    }
}


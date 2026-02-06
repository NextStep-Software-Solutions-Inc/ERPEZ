using FluentValidation;

namespace ERPEZ.Application.Features.Planning.ProcurementWorkflow.Commands.UpdateProcurementWorkflow;

public class UpdateProcurementWorkflowCommandValidator : AbstractValidator<UpdateProcurementWorkflowCommand>
{
    public UpdateProcurementWorkflowCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Id is required.");

        RuleFor(x => x.Request.Name)
            .MaximumLength(200)
            .WithMessage("Name cannot exceed 200 characters.")
            .When(x => x.Request.Name != null);

        RuleFor(x => x.Request.Code)
            .MaximumLength(50)
            .WithMessage("Code cannot exceed 50 characters.")
            .When(x => x.Request.Code != null);

        RuleFor(x => x.Request.ApprovalLevel)
            .GreaterThan(0)
            .WithMessage("Approval Level must be greater than 0.")
            .When(x => x.Request.ApprovalLevel.HasValue);
    }
}

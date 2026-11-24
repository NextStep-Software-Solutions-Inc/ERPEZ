using FluentValidation;

namespace ERPEZ.Application.Features.Planning.ProcurementWorkflow.Commands.CreateProcurementWorkflow;

public class CreateProcurementWorkflowCommandValidator : AbstractValidator<CreateProcurementWorkflowCommand>
{
    public CreateProcurementWorkflowCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Name is required.")
            .MaximumLength(200)
            .WithMessage("Name cannot exceed 200 characters.");

        RuleFor(x => x.Code)
            .NotEmpty()
            .WithMessage("Code is required.")
            .MaximumLength(50)
            .WithMessage("Code cannot exceed 50 characters.");

        RuleFor(x => x.ApprovalLevel)
            .GreaterThan(0)
            .WithMessage("Approval Level must be greater than 0.");
    }
}

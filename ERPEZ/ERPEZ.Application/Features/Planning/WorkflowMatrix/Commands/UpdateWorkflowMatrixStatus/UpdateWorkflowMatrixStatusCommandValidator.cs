using FluentValidation;

namespace ERPEZ.Application.Features.Planning.WorkflowMatrix.Commands.UpdateWorkflowMatrixStatus;

public class UpdateWorkflowMatrixStatusCommandValidator : AbstractValidator<UpdateWorkflowMatrixStatusCommand>
{
    public UpdateWorkflowMatrixStatusCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Workflow Matrix ID is required.");

        RuleFor(x => x.Status)
            .NotEmpty()
            .WithMessage("Status is required.")
            .Must(status => status.Equals("Active", StringComparison.OrdinalIgnoreCase) || 
                           status.Equals("Inactive", StringComparison.OrdinalIgnoreCase))
            .WithMessage("Status must be either 'Active' or 'Inactive'.");
    }
}

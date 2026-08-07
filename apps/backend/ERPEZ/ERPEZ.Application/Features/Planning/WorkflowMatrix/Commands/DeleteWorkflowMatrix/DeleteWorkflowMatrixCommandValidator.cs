using FluentValidation;

namespace ERPEZ.Application.Features.Planning.WorkflowMatrix.Commands.DeleteWorkflowMatrix;

public class DeleteWorkflowMatrixCommandValidator : AbstractValidator<DeleteWorkflowMatrixCommand>
{
    public DeleteWorkflowMatrixCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Workflow Matrix Id is required.");
    }
}

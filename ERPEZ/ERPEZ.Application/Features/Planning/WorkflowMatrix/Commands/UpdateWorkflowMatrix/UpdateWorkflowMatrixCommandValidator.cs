using FluentValidation;

namespace ERPEZ.Application.Features.Planning.WorkflowMatrix.Commands.UpdateWorkflowMatrix;

public class UpdateWorkflowMatrixCommandValidator : AbstractValidator<UpdateWorkflowMatrixCommand>
{
    public UpdateWorkflowMatrixCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Workflow Matrix Id is required.");

        RuleFor(x => x.DocumentType)
            .MaximumLength(100)
            .When(x => !string.IsNullOrEmpty(x.DocumentType))
            .WithMessage("Document Type cannot exceed 100 characters.");
    }
}

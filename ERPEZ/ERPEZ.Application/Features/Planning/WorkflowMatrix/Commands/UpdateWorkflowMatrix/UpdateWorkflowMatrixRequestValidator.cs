using FluentValidation;

namespace ERPEZ.Application.Features.Planning.WorkflowMatrix.Commands.UpdateWorkflowMatrix;

public class UpdateWorkflowMatrixRequestValidator : AbstractValidator<UpdateWorkflowMatrixRequest>
{
    public UpdateWorkflowMatrixRequestValidator()
    {
        RuleFor(x => x.DocumentType)
            .MaximumLength(100)
            .When(x => !string.IsNullOrEmpty(x.DocumentType))
            .WithMessage("Document Type cannot exceed 100 characters.");
    }
}

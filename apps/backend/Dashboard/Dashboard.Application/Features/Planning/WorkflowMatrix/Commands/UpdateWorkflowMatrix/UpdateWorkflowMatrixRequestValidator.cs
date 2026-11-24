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

        RuleFor(x => x.RecommendingApproverPositionId)
            .NotEmpty()
            .When(x => x.RecommendingApproverPositionId.HasValue)
            .WithMessage("Recommending Approver Position Id must be a valid GUID.");

        RuleFor(x => x.FinalApproverPositionId)
            .NotEmpty()
            .When(x => x.FinalApproverPositionId.HasValue)
            .WithMessage("Final Approver Position Id must be a valid GUID.");
    }
}

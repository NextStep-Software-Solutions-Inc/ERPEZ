using FluentValidation;

namespace ERPEZ.Application.Features.Planning.WorkflowMatrix.Commands.CreateWorkflowMatrix;

public class CreateWorkflowMatrixCommandValidator : AbstractValidator<CreateWorkflowMatrixCommand>
{
    public CreateWorkflowMatrixCommandValidator()
    {
        RuleFor(x => x.OfficeId)
            .NotEmpty()
            .WithMessage("Office is required.");

        RuleFor(x => x.FiscalYearId)
            .NotEmpty()
            .WithMessage("Fiscal Year is required.");

        RuleFor(x => x.RecommendingApproverPositionId)
            .NotEmpty()
            .WithMessage("Recommending Approver Position is required.");

        RuleFor(x => x.FinalApproverPositionId)
            .NotEmpty()
            .WithMessage("Final Approver Position is required.");

        RuleFor(x => x.DocumentType)
            .MaximumLength(100)
            .When(x => !string.IsNullOrEmpty(x.DocumentType))
            .WithMessage("Document Type cannot exceed 100 characters.");
    }
}

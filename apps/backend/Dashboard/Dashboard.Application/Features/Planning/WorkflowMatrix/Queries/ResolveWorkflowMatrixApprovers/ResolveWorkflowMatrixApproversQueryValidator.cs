using FluentValidation;

namespace ERPEZ.Application.Features.Planning.WorkflowMatrix.Queries.ResolveWorkflowMatrixApprovers;

public class ResolveWorkflowMatrixApproversQueryValidator : AbstractValidator<ResolveWorkflowMatrixApproversQuery>
{
    public ResolveWorkflowMatrixApproversQueryValidator()
    {
        RuleFor(x => x.OfficeId)
            .NotEmpty()
            .WithMessage("Office ID is required.");

        RuleFor(x => x.RecommendingApproverUserId)
            .NotEmpty()
            .WithMessage("Recommending Approver User ID is required.");

        RuleFor(x => x.FinalApproverUserId)
            .NotEmpty()
            .WithMessage("Final Approver User ID is required.");
    }
}

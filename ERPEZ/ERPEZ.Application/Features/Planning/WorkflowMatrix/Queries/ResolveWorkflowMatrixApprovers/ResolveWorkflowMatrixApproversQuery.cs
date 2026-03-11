using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WorkflowMatrix.Queries.ResolveWorkflowMatrixApprovers;

public record ResolveWorkflowMatrixApproversRequest
{
    public Guid OfficeId { get; init; }
    public Guid RecommendingApproverUserId { get; init; }
    public Guid FinalApproverUserId { get; init; }
}

public record ResolveWorkflowMatrixApproversQuery : IRequest<ApiResponse<ResolveWorkflowMatrixApproversResponse>>
{
    public Guid OfficeId { get; init; }
    public Guid RecommendingApproverUserId { get; init; }
    public Guid FinalApproverUserId { get; init; }
}

public record ResolveWorkflowMatrixApproversResponse
{
    public Guid OfficeId { get; init; }
    public ResolvedApprover RecommendingApprover { get; init; } = new();
    public ResolvedApprover FinalApprover { get; init; } = new();
}

public record ResolvedApprover
{
    public Guid UserId { get; init; }
    public string UserName { get; init; } = string.Empty;
    public Guid PositionId { get; init; }
    public string PositionTitle { get; init; } = string.Empty;
    public string PositionCode { get; init; } = string.Empty;
}

using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WorkflowMatrix.Commands.UpdateWorkflowMatrix;

public record UpdateWorkflowMatrixRequest
{
    public string? DocumentType { get; init; }
    public Guid? RecommendingApproverPositionId { get; init; }
    public Guid? FinalApproverPositionId { get; init; }
}

public record UpdateWorkflowMatrixCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; init; }
    public string? DocumentType { get; init; }
    public Guid? RecommendingApproverPositionId { get; init; }
    public Guid? FinalApproverPositionId { get; init; }
}

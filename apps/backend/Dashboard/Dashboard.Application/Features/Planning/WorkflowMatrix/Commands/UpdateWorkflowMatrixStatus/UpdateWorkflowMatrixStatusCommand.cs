using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WorkflowMatrix.Commands.UpdateWorkflowMatrixStatus;

public record UpdateWorkflowMatrixStatusRequest
{
    public string Status { get; init; } = string.Empty;
}

public record UpdateWorkflowMatrixStatusCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; init; }
    public string Status { get; init; } = string.Empty;
}

using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WorkflowMatrix.Commands.UpdateWorkflowMatrix;

public record UpdateWorkflowMatrixRequest
{
    public string? DocumentType { get; init; }
}

public record UpdateWorkflowMatrixCommand : IRequest<ApiResponse<Guid>>
{
    public Guid Id { get; init; }
    public string? DocumentType { get; init; }
}

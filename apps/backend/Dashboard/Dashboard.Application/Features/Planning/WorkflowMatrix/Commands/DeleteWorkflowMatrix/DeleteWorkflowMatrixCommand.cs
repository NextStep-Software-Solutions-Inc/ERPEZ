using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WorkflowMatrix.Commands.DeleteWorkflowMatrix;

public record DeleteWorkflowMatrixCommand(Guid Id) : IRequest<ApiResponse<Unit>>;

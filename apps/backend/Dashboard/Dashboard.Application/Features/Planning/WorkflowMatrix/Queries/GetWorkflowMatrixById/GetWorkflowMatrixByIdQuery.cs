using ERPEZ.Application.Features.Planning.WorkflowMatrix.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WorkflowMatrix.Queries.GetWorkflowMatrixById;

public record GetWorkflowMatrixByIdQuery(Guid Id) : IRequest<ApiResponse<WorkflowMatrixResponse>>;

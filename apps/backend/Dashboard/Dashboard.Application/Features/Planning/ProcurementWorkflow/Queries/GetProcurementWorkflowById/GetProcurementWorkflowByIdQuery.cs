using ERPEZ.Application.Features.Planning.ProcurementWorkflow.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ProcurementWorkflow.Queries.GetProcurementWorkflowById;

public record GetProcurementWorkflowByIdQuery(Guid Id) : IRequest<ApiResponse<ProcurementWorkflowResponse>>;

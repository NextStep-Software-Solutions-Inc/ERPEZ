using ERPEZ.Application.Features.Planning.ProcurementWorkflow.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ProcurementWorkflow.Commands.UpdateProcurementWorkflow;

public record UpdateProcurementWorkflowCommand : IRequest<ApiResponse<Unit>>
{
    public required Guid Id { get; init; }
    public required UpdateProcurementWorkflowRequest UpdateProcurementWorkflow { get; init; }
}

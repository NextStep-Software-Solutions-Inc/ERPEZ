using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ProcurementWorkflow.Commands.CreateProcurementWorkflow;

public record CreateProcurementWorkflowCommand : IRequest<ApiResponse<Guid>>
{
    public required string Name { get; init; }
    public required string Code { get; init; }
    public required int ApprovalLevel { get; init; }
}

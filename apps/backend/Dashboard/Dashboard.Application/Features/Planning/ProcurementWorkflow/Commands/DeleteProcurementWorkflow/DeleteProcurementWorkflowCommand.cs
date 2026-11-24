using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ProcurementWorkflow.Commands.DeleteProcurementWorkflow;

public record DeleteProcurementWorkflowCommand(Guid Id) : IRequest<ApiResponse<Unit>>;

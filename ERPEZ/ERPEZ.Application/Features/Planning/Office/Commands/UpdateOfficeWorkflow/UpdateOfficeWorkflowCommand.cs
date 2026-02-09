using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Office.Commands.UpdateOfficeWorkflow;

public class UpdateOfficeWorkflowCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; set; }
    public Guid? ProcurementWorkflowId { get; set; }
}

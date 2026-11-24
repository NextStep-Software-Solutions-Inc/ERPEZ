using ERPEZ.Shared.Common;
using MediatR;
using System.Text.Json.Serialization;

namespace ERPEZ.Application.Features.Planning.Office.Commands.UpdateOfficeWorkflow;

public class UpdateOfficeWorkflowCommand : IRequest<ApiResponse<Unit>>
{
    [JsonIgnore]
    public Guid Id { get; set; }
    public Guid? ProcurementWorkflowId { get; set; }
}

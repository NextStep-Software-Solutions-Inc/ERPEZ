namespace ERPEZ.Application.Features.Planning.ProcurementWorkflow.Dtos;

public record UpdateProcurementWorkflowRequest
{
    public string? Name { get; init; }
    public string? Code { get; init; }
    public int? ApprovalLevel { get; init; }
    public bool? IsActive { get; init; }
}

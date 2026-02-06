namespace ERPEZ.Application.Features.Planning.ProcurementWorkflow.Dtos;

public record ProcurementWorkflowResponse
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required string Code { get; init; }
    public required int ApprovalLevel { get; init; }
    public required bool IsActive { get; init; }
    public required DateTime CreatedAt { get; init; }
}

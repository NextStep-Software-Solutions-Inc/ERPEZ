namespace ERPEZ.Application.Features.Planning.DUKPIAssignment.Dtos;

public record DUKPIAssignmentsResponse
{
    public Guid KPIId { get; init; }
    public Guid DeliveryUnitId { get; init; }
    public List<DUKPITargetResponse> DUKPITargets { get; init; } = [];
}

public record DUKPITargetResponse
{
    public Guid DUKPIAssignmentId { get; init; }
    public Guid TargetId { get; init; }
    public decimal AllocatedTargetValue { get; init; }
}

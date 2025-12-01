namespace ERPEZ.Domain.Dtos.Planning;

public record DUKPIAssignmentsGroupedResponse
{
    public Guid KPIId { get; init; }
    public required DeliveryUnitGroupedResponse DeliveryUnit { get; init; }
    public List<DUKPITargetGroupedResponse> DUKPITargets { get; init; } = [];
}

public record DUKPITargetGroupedResponse
{
    public Guid DUKPIAssignmentId { get; init; }
    public Guid TargetId { get; init; }
    public decimal AllocatedTargetValue { get; init; }
}

public record DeliveryUnitGroupedResponse
{
    public Guid Id { get; init; }
    public required string OfficeName { get; init; }
}
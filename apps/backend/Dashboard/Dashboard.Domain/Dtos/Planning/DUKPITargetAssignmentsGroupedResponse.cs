namespace ERPEZ.Domain.Dtos.Planning;

public record DUKPITargetAssignmentsGroupedResponse
{
    public required DeliveryUnitGroupedResponse DeliveryUnit { get; init; }
    public List<DUKPITargetGroupedResponse> DUKPITargets { get; init; } = [];
}

public record DUKPITargetGroupedResponse
{
    public Guid KPIId { get; init; }

    public Guid DUKPITargetAssignmentId { get; init; }
    public Guid TargetId { get; init; }
    public decimal AllocatedTargetValue { get; init; }
}

public record DeliveryUnitGroupedResponse
{
    public Guid Id { get; init; }
    public required string OfficeName { get; init; }
}
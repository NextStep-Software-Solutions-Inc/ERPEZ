namespace ERPEZ.Application.Features.Planning.DUKPITargetAssignment.Dtos;

public record DUKPITargetAssignmentRequest
{
    public Guid KPIId { get; set; }
    public Guid DeliveryUnitId { get; set; }
    public List<DUKPITarget> DUKPITargets { get; set; } = [];
}

public record DUKPITarget
{
    public Guid TargetId { get; init; }
    public decimal AllocatedTargetValue { get; init; }
}

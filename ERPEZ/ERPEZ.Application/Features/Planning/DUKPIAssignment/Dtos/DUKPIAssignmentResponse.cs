namespace ERPEZ.Application.Features.Planning.DUKPIAssignment.Dtos;

public class DUKPIAssignmentResponse
{
    public Guid KPIId { get; set; }
    public Guid DeliveryUnitId { get; set; }
    public List<DUKPITargetResponse> DUKPITargets { get; set; } = [];
}

public record DUKPITargetResponse
{
    public Guid DUKPIAssignmentId { get; init; }
    public Guid TargetId { get; init; }
    public decimal AllocatedTargetValue { get; init; }
}
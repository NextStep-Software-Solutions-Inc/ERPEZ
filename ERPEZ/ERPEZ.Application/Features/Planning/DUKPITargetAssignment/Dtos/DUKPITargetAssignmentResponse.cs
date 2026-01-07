namespace ERPEZ.Application.Features.Planning.DUKPITargetAssignment.Dtos;

public record DUKPITargetAssignmentResponse
{
    public Guid Id { get; init; }
    public Guid KPIId { get; init; }
    public Guid DeliveryUnitId { get; init; }
    public Guid TargetId { get; init; }
    public decimal AllocatedTargetValue { get; init; }
}

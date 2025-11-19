namespace ERPEZ.Application.Features.Planning.DUKPIAssignment.Dtos;

public record DUKPIAssignmentResponse
{   
    public Guid Id { get; init; }
    public Guid KPIId { get; init; }
    public Guid DeliveryUnitId { get; init; }
    public Guid TargetId { get; init; }
    public decimal AllocatedTargetValue { get; init; }
}

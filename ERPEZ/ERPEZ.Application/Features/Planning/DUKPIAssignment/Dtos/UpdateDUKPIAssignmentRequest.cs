namespace ERPEZ.Application.Features.Planning.DUKPIAssignment.Dtos;

public record UpdateDUKPIAssignmentRequest
{
    public Guid TargetId { get; init; }
    public decimal AllocatedTargetValue { get; init; }
}

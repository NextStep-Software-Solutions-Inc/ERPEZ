namespace ERPEZ.Application.Features.Planning.DUKPIAssignment.Dtos;

public class DUKPIAssignmentDto
{
    public Guid Id { get; set; }
    public Guid KPIId { get; set; }
    public Guid DeliveryUnitId { get; set; }
    public Guid KPITargetId { get; set; }
    public decimal AllocatedTargetValue { get; set; }
}

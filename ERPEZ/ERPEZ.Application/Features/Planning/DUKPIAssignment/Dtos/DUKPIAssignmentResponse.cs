namespace ERPEZ.Application.Features.Planning.DUKPIAssignment.Dtos;

public class DUKPIAssignmentResponse
{
    public Guid KPIId { get; set; }
    public Guid DeliveryUnitId { get; set; }
    public List<DUKPITarget> DUKPITargets { get; set; } = [];
}

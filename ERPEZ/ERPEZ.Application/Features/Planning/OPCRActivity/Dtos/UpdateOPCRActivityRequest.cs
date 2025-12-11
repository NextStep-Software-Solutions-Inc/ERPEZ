namespace ERPEZ.Application.Features.Planning.OPCRActivity.Dtos;

public class UpdateOPCRActivityRequest
{
    public Guid? OPCRId { get; set; }
    public Guid? DUKPIAssignmentId { get; set; }
    public string? Name { get; set; }
    public string? Description { get; set; }
    public decimal? Budget { get; set; }
}

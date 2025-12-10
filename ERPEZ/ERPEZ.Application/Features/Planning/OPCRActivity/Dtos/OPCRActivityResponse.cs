namespace ERPEZ.Application.Features.Planning.OPCRActivity.Dtos;

public class OPCRActivityResponse
{
    public Guid Id { get; set; }
    public Guid OPCRId { get; set; }
    public Guid DUKPIAssignmentId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Budget { get; set; }
}

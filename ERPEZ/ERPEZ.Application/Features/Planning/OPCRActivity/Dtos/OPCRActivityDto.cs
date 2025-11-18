namespace ERPEZ.Application.Features.Planning.OPCRActivity.Dtos;

public class OPCRActivityDto
{
    public Guid Id { get; set; }
    public Guid OPCRKPIId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Budget { get; set; }
}

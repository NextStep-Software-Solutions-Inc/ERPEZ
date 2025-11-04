namespace ERPEZ.Application.Features.Planning.OPCRActivity.Dtos;

public class UpdateOPCRActivityDto
{
    public Guid? OPCRKPIId { get; set; }
    public string? Name { get; set; }
    public string? Description { get; set; }
    public decimal? Budget { get; set; }
}

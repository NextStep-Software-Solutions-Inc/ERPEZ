namespace ERPEZ.Application.Features.Planning.OPCR.Dtos;

public class OPCRDetailedResponse
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public string? Code { get; set; }
    public string? Description { get; set; }
    public string? Status { get; set; }
    public Guid? DeliveryUnitId { get; set; }
    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
}

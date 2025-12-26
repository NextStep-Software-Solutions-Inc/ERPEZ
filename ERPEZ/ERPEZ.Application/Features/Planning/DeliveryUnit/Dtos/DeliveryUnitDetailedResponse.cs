namespace ERPEZ.Application.Features.Planning.DeliveryUnit.Dtos;

public class DeliveryUnitDetailedResponse
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public string? Code { get; set; }
    public string? Description { get; set; }
    public Guid? OfficeId { get; set; }
    public string? OfficeName { get; set; }
    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
}

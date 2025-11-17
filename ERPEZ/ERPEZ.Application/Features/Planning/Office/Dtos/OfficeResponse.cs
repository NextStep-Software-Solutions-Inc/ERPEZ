namespace ERPEZ.Application.Features.Planning.Office.Dtos;

public class OfficeResponse
{
    public Guid Id { get; set; }
    public Guid? ClusterId { get; set; }
    public string OfficeHead { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Address { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string ContactNumber { get; set; } = string.Empty;
    public string? ResponsibilityCenterCode { get; set; }
    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
}

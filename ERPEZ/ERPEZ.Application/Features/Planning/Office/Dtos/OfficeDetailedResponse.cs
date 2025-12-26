namespace ERPEZ.Application.Features.Planning.Office.Dtos;

public class OfficeDetailedResponse
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public string? Code { get; set; }
    public string? Address { get; set; }
    public string? ContactNumber { get; set; }
    public Guid? LocationId { get; set; }
    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
}

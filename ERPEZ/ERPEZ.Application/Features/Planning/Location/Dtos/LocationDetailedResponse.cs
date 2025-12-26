namespace ERPEZ.Application.Features.Planning.Location.Dtos;

public class LocationDetailedResponse
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public string? Code { get; set; }
    public string? Region { get; set; }
    public string? Province { get; set; }
    public string? Municipality { get; set; }
    public string? Barangay { get; set; }
    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
}

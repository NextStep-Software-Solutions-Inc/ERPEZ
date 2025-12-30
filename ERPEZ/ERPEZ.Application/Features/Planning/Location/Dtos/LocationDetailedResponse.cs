namespace ERPEZ.Application.Features.Planning.Location.Dtos;

public record LocationDetailedResponse
{
    public Guid Id { get; init; }
    public required string Name { get; init; }
    public string? Code { get; init; }
    public string? Region { get; init; }
    public string? Province { get; init; }
    public string? Municipality { get; init; }
    public string? Barangay { get; init; }
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
    public DateTime? UpdatedAt { get; init; }
    public string? UpdatedBy { get; init; }
}

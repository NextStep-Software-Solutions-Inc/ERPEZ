namespace ERPEZ.Application.Features.Planning.Office.Dtos;

public record OfficeDetailedResponse
{
    public Guid Id { get; init; }
    public required string Name { get; init; }
    public string? Code { get; init; }
    public string? Address { get; init; }
    public string? ContactNumber { get; init; }
    public Guid? LocationId { get; init; }
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
    public DateTime? UpdatedAt { get; init; }
    public string? UpdatedBy { get; init; }
}

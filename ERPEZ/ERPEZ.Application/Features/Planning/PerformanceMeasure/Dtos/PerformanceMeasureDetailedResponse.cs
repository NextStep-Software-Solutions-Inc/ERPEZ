namespace ERPEZ.Application.Features.Planning.PerformanceMeasure.Dtos;

public record PerformanceMeasureDetailedResponse
{
    public Guid Id { get; init; }
    public required string Name { get; init; }
    public string? Description { get; init; }
    public string? Unit { get; init; }
    public Guid? KPIId { get; init; }
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
    public DateTime? UpdatedAt { get; init; }
    public string? UpdatedBy { get; init; }
}

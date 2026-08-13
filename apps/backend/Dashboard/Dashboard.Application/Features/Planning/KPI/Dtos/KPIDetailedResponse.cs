namespace ERPEZ.Application.Features.Planning.KPI.Dtos;

public record KPIDetailedResponse
{
    public Guid Id { get; init; }
    public required string Name { get; init; }
    public string? Code { get; init; }
    public string? Description { get; init; }
    public string? MeasurementType { get; init; }
    public Guid? DeliveryUnitId { get; init; }
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
    public DateTime? UpdatedAt { get; init; }
    public string? UpdatedBy { get; init; }
}

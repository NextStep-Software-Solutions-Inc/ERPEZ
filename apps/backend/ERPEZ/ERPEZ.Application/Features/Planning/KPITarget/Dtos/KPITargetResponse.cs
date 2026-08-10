namespace ERPEZ.Application.Features.Planning.KPITarget.Dtos;

public record KPITargetResponse
{
    public required Guid Id { get; init; }
    public required Guid KPIId { get; init; }
    public required decimal TargetValue { get; init; }
    public required decimal RemainingTargetValue { get; init; }
    public required string Period { get; init; } = string.Empty;
    public string? QuarterName { get; init; }
    public required DateTime CreatedAt { get; init; }
    public required string CreatedBy { get; init; } = string.Empty;
}

namespace ERPEZ.Application.Features.Planning.ProcurementModeThreshold.Dtos;

public record ProcurementModeThresholdResponse
{
    public Guid Id { get; init; }
    public Guid ProcurementModeId { get; init; }
    public string ProcurementModeName { get; init; } = string.Empty;
    public decimal MinThreshold { get; init; }
    public decimal? MaxThreshold { get; init; }
    public DateTime EffectivityStart { get; init; }
    public DateTime? EffectivityEnd { get; init; }
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
    public DateTime? UpdatedAt { get; init; }
    public string? UpdatedBy { get; init; }
}

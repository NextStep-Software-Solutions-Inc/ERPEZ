namespace ERPEZ.Application.Features.Planning.ProcurementPolicyConfig.Dtos;

public record ProcurementPolicyConfigResponse
{
    public Guid Id { get; init; }
    public Guid FiscalYearId { get; init; }
    public int FiscalYearYear { get; init; }
    public Guid ProcurementModeId { get; init; }
    public string ProcurementModeName { get; init; } = string.Empty;
    public Guid ProcurementModeThresholdId { get; init; }
    public decimal MinAmount { get; init; }
    public decimal? MaxAmount { get; init; }
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
    public DateTime? UpdatedAt { get; init; }
    public string? UpdatedBy { get; init; }
}

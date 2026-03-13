namespace ERPEZ.Application.Features.Planning.FYActiveKPI.Queries.GetFYActiveKPIs;

public record FYActiveKPIResponse
{
    public Guid Id { get; init; }
    public Guid FiscalYearId { get; init; }
    public Guid MasterKPIId { get; init; }
    public Guid? ParentKPIId { get; init; }
    public Guid? MFOPAPId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Code { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string MeasurementUnit { get; init; } = string.Empty;
    public string DistributionBehavior { get; init; } = string.Empty;
    public string FunctionCategory { get; init; } = string.Empty;
    public string? MonitoringFrequency { get; init; }
    public bool IsOptInAvailable { get; init; }
    public bool IsGAD { get; init; }
    public string Status { get; init; } = string.Empty;
    public decimal AgencyTargetAnnual { get; init; }
    public decimal? AgencyTargetQ1 { get; init; }
    public decimal? AgencyTargetQ2 { get; init; }
    public decimal? AgencyTargetQ3 { get; init; }
    public decimal? AgencyTargetQ4 { get; init; }
    public DateTime CreatedAt { get; init; }
}

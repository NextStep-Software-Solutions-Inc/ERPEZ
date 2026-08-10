using System.Text.Json.Serialization;
using ERPEZ.Application.Features.Planning.OPCRActivity.Dtos;

namespace ERPEZ.Application.Features.Planning.OPCRItem.Dtos;

public record OPCRItemResponse
{
    public Guid Id { get; init; }
    public Guid OPCRId { get; init; }
    public Guid KPIAssignmentId { get; init; }
    public Guid OfficeId { get; init; }
    public string OfficeName { get; init; } = string.Empty;
    public Guid FiscalYearId { get; init; }
    public int FiscalYear { get; init; }
    public string KPIName { get; init; } = string.Empty;
    public string DistributionBehavior { get; init; } = string.Empty;
    public string MeasurementUnit { get; init; } = string.Empty;
    public decimal AssignedTargetAnnual { get; init; }
    public decimal? AssignedTargetQ1 { get; init; }
    public decimal? AssignedTargetQ2 { get; init; }
    public decimal? AssignedTargetQ3 { get; init; }
    public decimal? AssignedTargetQ4 { get; init; }
    public bool IsLocked { get; init; }
    public bool IsShopped { get; init; }
    public decimal Q1Target { get; init; }
    public decimal Q2Target { get; init; }
    public decimal Q3Target { get; init; }
    public decimal Q4Target { get; init; }
    public decimal ProposedAnnualTarget { get; init; }
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;

    [JsonPropertyName("OPCRActivities")]
    public List<OPCRActivityResponse> OPCRActivities { get; init; } = [];
}

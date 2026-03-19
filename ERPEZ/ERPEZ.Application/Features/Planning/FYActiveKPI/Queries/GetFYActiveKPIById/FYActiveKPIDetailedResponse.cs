using ERPEZ.Application.Features.Planning.Attribute.Dtos;
using ERPEZ.Application.Features.Planning.MFOPAP.Dtos;
using ERPEZ.Application.Features.Planning.SDG.Dtos;

namespace ERPEZ.Application.Features.Planning.FYActiveKPI.Queries.GetFYActiveKPIById;

public record FYActiveKPIDetailedResponse
{
    public Guid Id { get; init; }
    public Guid FiscalYearId { get; init; }
    public string FiscalYearName { get; init; } = string.Empty;
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
    public List<FYActiveKPIMeasurementResponse> Measurements { get; init; } = [];
    public List<KPIAssignmentResponse> Assignments { get; init; } = [];
    public MFOPAPResponse? MFOPAP { get; init; }
    public List<AttributeResponse> Attributes { get; init; } = [];
    public List<SDGResponse> SDGs { get; init; } = [];
    public DateTime CreatedAt { get; init; }
}

public record FYActiveKPIMeasurementResponse
{
    public Guid Id { get; init; }
    public string Dimension { get; init; } = string.Empty;
    public Guid? RatingScaleTemplateId { get; init; }
    public List<string> MOVs { get; init; } = [];
    public bool IsMOVEditable { get; init; }
    public bool IsScaleEditable { get; init; }
}

public record KPIAssignmentResponse
{
    public Guid Id { get; init; }
    public Guid OfficeId { get; init; }
    public string OfficeName { get; init; } = string.Empty;
    public decimal AssignedTargetAnnual { get; init; }
    public decimal? AssignedTargetQ1 { get; init; }
    public decimal? AssignedTargetQ2 { get; init; }
    public decimal? AssignedTargetQ3 { get; init; }
    public decimal? AssignedTargetQ4 { get; init; }
    public bool IsLocked { get; init; }
}

using ERPEZ.Application.Features.Planning.Attribute.Dtos;
using ERPEZ.Application.Features.Planning.KPIModeOfVerification.Dtos;
using ERPEZ.Application.Features.Planning.Rating.Dtos;
using ERPEZ.Application.Features.Planning.KPITarget.Dtos;
using ERPEZ.Application.Features.Planning.KPIMeasurement.Dtos;
using ERPEZ.Application.Features.Planning.SDG.Dtos;
using ERPEZ.Application.Features.Planning.MFOPAP.Dtos;
using System.Text.Json.Serialization;

namespace ERPEZ.Application.Features.Planning.KPI.Dtos;

public record KPIResponse
{
    public Guid Id { get; init; }
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
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
    
    [JsonPropertyName("KPIMeasurements")]
    public List<KPIMeasurementResponse> KPIMeasurements { get; init; } = [];
    
    // Legacy collections
    [JsonPropertyName("KPITargets")]
    public List<KPITargetResponse> KPITargets { get; init; } = [];
    [JsonPropertyName("KPIRatings")]
    public List<RatingResponse> KPIRatings { get; init; } = [];
    [JsonPropertyName("KPIModeOfVerifications")]
    public List<KPIModeOfVerificationResponse> KPIModeOfVerifications { get; init; } = [];
    
    [JsonPropertyName("MFOPAP")]
    public MFOPAPResponse? MFOPAP { get; init; }
    [JsonPropertyName("Attributes")]
    public List<AttributeResponse> Attributes { get; init; } = [];
    [JsonPropertyName("SDGs")]
    public List<SDGResponse> SDGs { get; init; } = [];
}

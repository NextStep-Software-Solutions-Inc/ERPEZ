using ERPEZ.Application.Features.Planning.Attribute.Dtos;
using ERPEZ.Application.Features.Planning.KPIModeOfVerification.Dtos;
using ERPEZ.Application.Features.Planning.KPIRating.Dtos;
using ERPEZ.Application.Features.Planning.KPITarget.Dtos;
using ERPEZ.Application.Features.Planning.SDG.Dtos;
using ERPEZ.Application.Features.Planning.MFOPAP.Dtos;
using System.Text.Json.Serialization;

namespace ERPEZ.Application.Features.Planning.KPI.Dtos;

public record KPIResponse
{
    public Guid Id { get; init; }
    public Guid? ParentKPIId { get; init; }
    public string FunctionType { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; } = string.Empty;
    public bool IsOfficeMandate { get; init; }
    public bool IsPercentage { get; init; }
    public string Status { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
    [JsonPropertyName("KPITargets")]
    public List<KPITargetResponse> KPITargets { get; init; } = [];
    [JsonPropertyName("KPIRatings")]
    public List<KPIRatingResponse> KPIRatings { get; init; } = [];
    [JsonPropertyName("KPIModeOfVerifications")]
    public List<KPIModeOfVerificationDto> KPIModeOfVerifications { get; init; } = [];
    [JsonPropertyName("MFOPAPs")]
    public List<MFOPAPResponse> MFOPAPs { get; init; } = [];
    [JsonPropertyName("Attributes")]
    public List<AttributeResponse> Attributes { get; init; } = [];
    [JsonPropertyName("SDGs")]
    public List<SDGResponse> SDGs { get; init; } = [];
    public bool IsTargetValueAllocable { get; init; }
}

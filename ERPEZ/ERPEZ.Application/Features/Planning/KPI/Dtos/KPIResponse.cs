using ERPEZ.Application.Features.Planning.KPIModeOfVerification.Dtos;
using ERPEZ.Application.Features.Planning.KPIRating.Dtos;
using ERPEZ.Application.Features.Planning.KPITarget.Dtos;
using ERPEZ.Application.Features.Planning.MFOKPI.Dtos;
using ERPEZ.Domain.Entities.Planning;
using System.Text.Json.Serialization;

namespace ERPEZ.Application.Features.Planning.KPI.Dtos;

public class KPIResponse
{
    public Guid Id { get; set; }
    public Guid? ParentKPIId { get; set; }
    public string FunctionType { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; } = string.Empty;
    public bool IsOfficeMandate { get; set; }
    public bool IsPercentage { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    [JsonPropertyName("KPITargets")]
    public List<KPITargetResponse> KPITargets { get; set; } = [];
    [JsonPropertyName("KPIRatings")]
    public List<KPIRatingResponse> KPIRatings { get; set; } = [];
    [JsonPropertyName("KPIModeOfVerifications")]
    public List<KPIModeOfVerificationDto> KPIModeOfVerifications { get; set; } = [];
    [JsonPropertyName("MFOKPIs")]
    public List<MFOKPIDto> MFOKPIs { get; set; } = [];
    [JsonPropertyName("Attributes")]
    public List<AttributeResponse> Attributes { get; set; } = [];
    [JsonPropertyName("SDGs")]
    public List<SDGResponse> SDGs { get; set; } = [];

}

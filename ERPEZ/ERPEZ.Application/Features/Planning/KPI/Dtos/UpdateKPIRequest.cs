using System.Text.Json.Serialization;

namespace ERPEZ.Application.Features.Planning.KPI.Dtos;

public record UpdateKPIRequest
{
    public Guid? ParentKPIId { get; init; }
    public string? FunctionType { get; init; }
    public string? Name { get; init; }
    public string? Description { get; init; }
    public bool? IsOfficeMandate { get; init; }
    public bool? IsPercentage { get; init; }
    public bool? IsTargetValueAllocable { get; init; }
    public string? Status { get; init; }

    [JsonPropertyName("SDGIds")]
    public List<Guid>? SDGIds { get; init; }
    
    /// <summary>
    /// List of KPI ratings to upsert. Include Id to update existing, omit Id to create new.
    /// Existing ratings not in this list will be deleted.
    /// </summary>
    [JsonPropertyName("KPIRatings")]
    public List<UpsertKPIRatingRequest>? KPIRatings { get; init; }
    
    /// <summary>
    /// List of KPI targets to upsert. Include Id to update existing, omit Id to create new.
    /// Existing targets not in this list will be deleted only if they're not referenced by other entities.
    /// </summary>
    [JsonPropertyName("KPITargets")]
    public List<UpsertKPITargetRequest>? KPITargets { get; init; }
    
    /// <summary>
    /// List of KPI mode of verifications to upsert. Include Id to update existing, omit Id to create new.
    /// Existing MOVs not in this list will be deleted.
    /// </summary>
    [JsonPropertyName("KPIMOVs")]
    public List<UpsertKPIMOVRequest>? KPIMOVs { get; init; }
    
    [JsonPropertyName("MFOPAPIds")]
    public List<Guid>? MFOPAPIds { get; init; }
    [JsonPropertyName("AttributeIds")]
    public List<Guid>? AttributeIds { get; init; }
}

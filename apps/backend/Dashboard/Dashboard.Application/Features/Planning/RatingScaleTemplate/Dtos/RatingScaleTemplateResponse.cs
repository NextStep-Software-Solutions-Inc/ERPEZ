using ERPEZ.Application.Features.Planning.RatingScaleLevel.Dtos;
using System.Text.Json.Serialization;

namespace ERPEZ.Application.Features.Planning.RatingScaleTemplate.Dtos;

public record RatingScaleTemplateResponse
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public bool IsFixed { get; init; }
    public bool IsDefault { get; init; }
    public Guid? GeneralRatingScaleId { get; init; }
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
    
    [JsonPropertyName("RatingScaleLevels")]
    public List<RatingScaleLevelResponse> RatingScaleLevels { get; init; } = [];
}

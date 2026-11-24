using ERPEZ.Shared.Common;
using MediatR;
using System.Text.Json.Serialization;

namespace ERPEZ.Application.Features.Planning.RatingScaleTemplate.Commands.CreateRatingScaleTemplate;

public record CreateRatingScaleTemplateCommand : IRequest<ApiResponse<Guid>>
{
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public bool IsFixed { get; init; }
    public bool IsDefault { get; init; }
    public Guid? GeneralRatingScaleId { get; init; }
    
    [JsonPropertyName("RatingScaleLevels")]
    public List<CreateRatingScaleLevelRequest> RatingScaleLevels { get; init; } = [];
}

public record CreateRatingScaleLevelRequest
{
    public int RatingValue { get; init; }
    public string? Description { get; init; }
    public decimal? MinValue { get; init; }
    public decimal? MaxValue { get; init; }
}

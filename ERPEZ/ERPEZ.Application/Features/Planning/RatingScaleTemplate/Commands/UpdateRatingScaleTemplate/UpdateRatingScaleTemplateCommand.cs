using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.RatingScaleTemplate.Commands.UpdateRatingScaleTemplate;

public record UpdateRatingScaleTemplateCommand : IRequest<ApiResponse<Unit>>
{
    public required Guid Id { get; init; }
    public required UpdateRatingScaleTemplateRequest UpdateRatingScaleTemplate { get; init; }
}

public record UpdateRatingScaleTemplateRequest
{
    public string? Name { get; init; }
    public string? Description { get; init; }
    public bool? IsFixed { get; init; }
    public bool? IsDefault { get; init; }
    
    // 1. Add this list to accept the array from the Frontend
    public List<UpdateRatingScaleLevelRequest>? RatingScaleLevels { get; init; }
}

// 2. Create this new record to match the objects inside the Frontend's array
public record UpdateRatingScaleLevelRequest
{
    public int RatingValue { get; init; }
    public string? Description { get; init; }
    public decimal? MinValue { get; init; }
    public decimal? MaxValue { get; init; }
}

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
}

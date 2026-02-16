using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.GeneralRatingScale.Commands.UpdateGeneralRatingScale;

public record UpdateGeneralRatingScaleRequest
{
    public string AdjectivalRatingName { get; init; } = string.Empty;
    public decimal MinScore { get; init; }
    public decimal MaxScore { get; init; }
}

public record UpdateGeneralRatingScaleCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; init; }
    public string AdjectivalRatingName { get; init; } = string.Empty;
    public decimal MinScore { get; init; }
    public decimal MaxScore { get; init; }
}

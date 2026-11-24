using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.GeneralRatingScale.Commands.CreateGeneralRatingScale;

public record CreateGeneralRatingScaleCommand : IRequest<ApiResponse<Guid>>
{
    public Guid FiscalYearId { get; init; }
    public string AdjectivalRatingName { get; init; } = string.Empty;
    public decimal MinScore { get; init; }
    public decimal MaxScore { get; init; }
}

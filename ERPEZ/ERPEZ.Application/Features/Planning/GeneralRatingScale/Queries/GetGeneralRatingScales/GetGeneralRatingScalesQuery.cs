using ERPEZ.Application.Features.Planning.GeneralRatingScale.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.GeneralRatingScale.Queries.GetGeneralRatingScales;

public record GetGeneralRatingScalesQuery : IRequest<PaginatedApiResponse<GeneralRatingScaleResponse>>
{
    public string? Filters { get; init; }
    public string? Sorts { get; init; }
    public int? Page { get; init; }
    public int? PageSize { get; init; }
}

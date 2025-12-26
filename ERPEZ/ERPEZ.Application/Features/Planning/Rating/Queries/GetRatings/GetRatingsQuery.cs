using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.Rating.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.Rating.Queries.GetRatings;

public record GetRatingsQuery : PaginatedQuery<PaginatedApiResponse<RatingResponse>>
{
}

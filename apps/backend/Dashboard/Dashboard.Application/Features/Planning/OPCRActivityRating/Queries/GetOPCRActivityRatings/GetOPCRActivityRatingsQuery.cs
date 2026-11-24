using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.OPCRActivityRating.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.OPCRActivityRating.Queries.GetOPCRActivityRatings;

public record GetOPCRActivityRatingsQuery : PaginatedQuery<PaginatedApiResponse<OPCRActivityRatingResponse>>
{
}

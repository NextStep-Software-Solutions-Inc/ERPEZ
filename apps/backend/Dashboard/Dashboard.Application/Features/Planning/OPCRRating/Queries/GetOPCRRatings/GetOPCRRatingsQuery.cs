using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.OPCRRating.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.OPCRRating.Queries.GetOPCRRatings;

public record GetOPCRRatingsQuery : PaginatedQuery<PaginatedApiResponse<OPCRRatingResponse>>
{
}

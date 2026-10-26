using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.KPIRating.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.KPIRating.Queries.GetKPIRatings;

public record GetKPIRatingsQuery : PaginatedQuery<PaginatedApiResponse<KPIRatingResponse>>
{
}

using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.UACSCodeSegment.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.UACSCodeSegment.Queries.GetUACSCodeSegments;

public record GetUACSCodeSegmentsQuery : PaginatedQuery<PaginatedApiResponse<UACSCodeSegmentResponse>>
{
}

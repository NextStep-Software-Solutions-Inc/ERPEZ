using ERPEZ.Application.Common.Queries;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.Object.Queries.GetObjects;

public record GetObjectsQuery : PaginatedQuery<PaginatedApiResponse<Domain.Entities.Planning.Object>>
{
}

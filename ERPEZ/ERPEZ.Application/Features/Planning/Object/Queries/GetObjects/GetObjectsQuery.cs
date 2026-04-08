using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.Object.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.Object.Queries.GetObjects;

public record GetObjectsQuery : PaginatedQuery<PaginatedApiResponse<ObjectResponse>>
{
    public Guid? FiscalYearId { get; init; }
}

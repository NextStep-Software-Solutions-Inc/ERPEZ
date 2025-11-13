using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Object.Queries.GetObjects;

public class GetObjectsQuery : IRequest<PaginatedApiResponse<Domain.Entities.Planning.Object>>
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? Filters { get; set; }
    public string? Sorts { get; set; }
}

using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Office.Queries.GetOfficesQuery;

public class GetOfficesQuery : IRequest<PaginatedApiResponse<Domain.Entities.Planning.Office>>
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? Filters { get; set; }
    public string? Sorts { get; set; }
}

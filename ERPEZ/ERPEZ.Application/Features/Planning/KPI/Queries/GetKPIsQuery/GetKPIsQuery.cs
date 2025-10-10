using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPI.Queries.GetKPIsQuery;

public class GetKPIsQuery : IRequest<PaginatedApiResponse<Domain.Entities.Planning.KPI>>
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? Filters { get; set; }
    public string? Sorts { get; set; }
}

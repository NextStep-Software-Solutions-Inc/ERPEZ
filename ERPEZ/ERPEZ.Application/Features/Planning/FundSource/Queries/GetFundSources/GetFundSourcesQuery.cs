using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FundSource.Queries.FundSources;

public class GetFundSourcesQuery : IRequest<PaginatedApiResponse<Domain.Entities.Planning.FundSource>>
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? Filters { get; set; }
    public string? Sorts { get; set; }
}

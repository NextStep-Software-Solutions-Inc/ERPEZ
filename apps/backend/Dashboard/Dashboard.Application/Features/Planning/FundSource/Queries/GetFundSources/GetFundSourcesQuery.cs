using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.FundSource.Dtos;
using ERPEZ.Shared.Common;
using MediatR;
namespace ERPEZ.Application.Features.Planning.FundSource.Queries.FundSources;

public record GetFundSourcesQuery : PaginatedQuery<PaginatedApiResponse<FundSourceResponse>>
{
    public Guid? FiscalYearId { get; init; }
}

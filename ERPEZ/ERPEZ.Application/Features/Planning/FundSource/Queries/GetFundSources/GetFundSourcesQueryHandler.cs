using ERPEZ.Application.Features.Planning.FundSource.Queries.FundSources;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FundSource.Queries.GetFundSources;

public class GetFundSourcesQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetFundSourcesQuery, PaginatedApiResponse<Domain.Entities.Planning.FundSource>>
{
    public async Task<PaginatedApiResponse<Domain.Entities.Planning.FundSource>> Handle(GetFundSourcesQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };
        var (fundSources, totalCount) = await unitOfWork.FundSourceRepository.GetAllAsync(sieveModel, cancellationToken: cancellationToken);
        return new PaginatedApiResponse<Domain.Entities.Planning.FundSource>(
            [.. fundSources],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
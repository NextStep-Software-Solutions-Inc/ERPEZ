using ERPEZ.Application.Features.Planning.FundSource.Dtos;
using ERPEZ.Application.Features.Planning.FundSource.Queries.FundSources;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.FundSource.Queries.GetFundSources;

public class GetFundSourcesQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetFundSourcesQuery, PaginatedApiResponse<FundSourceResponse>>
{
    public async Task<PaginatedApiResponse<FundSourceResponse>> Handle(GetFundSourcesQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.FundSource, FundSourceResponse>> projection = fundSource => new FundSourceResponse
        {
            Id = fundSource.Id,
            ParentId = fundSource.ParentId,
            Name = fundSource.Name,
            Code = fundSource.Code,
            Type = fundSource.Type.ToString(),
            TotalDUAllocatedFunds = 0m,
            TotalReceivedFunds = 0m,
            IsActive = fundSource.IsActive,
            CreatedBy = fundSource.CreatedBy,
            CreatedAt = fundSource.CreatedAt
        };

        var (fundSources, totalCount) = await unitOfWork.FundSourceRepository.GetAllAsync(sieveModel, projection, cancellationToken: cancellationToken);
        return new PaginatedApiResponse<FundSourceResponse>(
            [.. fundSources],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}

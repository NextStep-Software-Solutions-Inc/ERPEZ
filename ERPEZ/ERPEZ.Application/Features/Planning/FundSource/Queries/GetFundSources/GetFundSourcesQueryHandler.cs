using ERPEZ.Application.Features.Planning.FundSource.Dtos;
using ERPEZ.Application.Features.Planning.FundSource.Queries.FundSources;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.FundSource.Queries.GetFundSources;

public class GetFundSourcesQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetFundSourcesQuery, PaginatedApiResponse<FundSourceResponse>>
{
    public async Task<PaginatedApiResponse<FundSourceResponse>> Handle(GetFundSourcesQuery query, CancellationToken cancellationToken)
    {
        var accountsQuery = unitOfWork.AccountRepository.Query();
        var transactionsQuery = unitOfWork.AccountTransactionRepository.Query(t => t.Status == StatusEnum.Completed);

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
            TotalDUAllocatedFunds = accountsQuery
                .Where(a => a.FundSourceId == fundSource.Id)
                .Select(a => a.Balance)
                .DefaultIfEmpty(0m)
                .Sum(),
            TotalReceivedFunds = transactionsQuery
                .Where(t => t.ToAccount.FundSourceId == fundSource.Id)
                .Select(t => t.AmountTransfer)
                .DefaultIfEmpty(0m)
                .Sum(),
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

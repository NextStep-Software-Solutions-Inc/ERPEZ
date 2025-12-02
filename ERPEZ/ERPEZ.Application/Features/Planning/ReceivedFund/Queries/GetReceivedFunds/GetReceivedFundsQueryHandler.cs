using System.Linq.Expressions;
using ERPEZ.Application.Features.Planning.ReceivedFund.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ReceivedFund.Queries.GetReceivedFunds;

public class GetReceivedFundsQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetReceivedFundsQuery, PaginatedApiResponse<ReceivedFundResponse>>
{
    public async Task<PaginatedApiResponse<ReceivedFundResponse>> Handle(GetReceivedFundsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.ReceivedFund, ReceivedFundResponse>> projection = rf => new ReceivedFundResponse
        {
            Id = rf.Id,
            FundSource = new FundSourceResponse
            {
                Id = rf.FundSource.Id,
                Name = rf.FundSource.Name,
                Code = rf.FundSource.Code,
                Type = rf.FundSource.Type.ToString(),
                IsActive = rf.FundSource.IsActive,
            },
            Amount = rf.Amount,
            ReceivedDate = rf.ReceivedDate,
            Description = rf.Description,
        };

        var (receivedFunds, totalCount) = await unitOfWork.ReceivedFundRepository.GetAllAsync(sieveModel, projection, cancellationToken: cancellationToken);
        return new PaginatedApiResponse<ReceivedFundResponse>(
            [.. receivedFunds],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}

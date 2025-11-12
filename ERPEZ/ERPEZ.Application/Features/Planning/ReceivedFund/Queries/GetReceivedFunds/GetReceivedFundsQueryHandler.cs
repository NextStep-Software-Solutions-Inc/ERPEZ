using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ReceivedFund.Queries.GetReceivedFunds;

public class GetReceivedFundsQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetReceivedFundsQuery, PaginatedApiResponse<Domain.Entities.Planning.ReceivedFund>>
{
    public async Task<PaginatedApiResponse<Domain.Entities.Planning.ReceivedFund>> Handle(GetReceivedFundsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };
        var (receivedFunds, totalCount) = await unitOfWork.ReceivedFundRepository.GetAllAsync(sieveModel, cancellationToken: cancellationToken);
        return new PaginatedApiResponse<Domain.Entities.Planning.ReceivedFund>(
            [.. receivedFunds],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}

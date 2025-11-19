using ERPEZ.Application.Features.Planning.Location.Queries.GetLocations;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;

namespace ERPEZ.Application.Features.Planning.MFOPAP.Queries.GetMFOPAPs;

public class GetMFOPAPsQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetMFOPAPsQuery, PaginatedApiResponse<Domain.Entities.Planning.MFOPAP>>
{
    public async Task<PaginatedApiResponse<Domain.Entities.Planning.MFOPAP>> Handle(GetMFOPAPsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };
        var (mfoPAPs, totalCount) = await unitOfWork.MFOPAPRepository.GetAllAsync(sieveModel, cancellationToken: cancellationToken);

        return new PaginatedApiResponse<Domain.Entities.Planning.MFOPAP>(
            [.. mfoPAPs],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}

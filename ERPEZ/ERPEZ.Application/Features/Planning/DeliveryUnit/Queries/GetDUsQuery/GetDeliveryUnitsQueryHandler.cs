using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DeliveryUnit.Queries.GetDUsQuery;

public class GetDeliveryUnitsQueryHandler(IUnitOfWork _unitOfWork) : IRequestHandler<GetDeliveryUnitsQuery, PaginatedApiResponse<Domain.Entities.Planning.DeliveryUnit>>
{
    public async Task<PaginatedApiResponse<Domain.Entities.Planning.DeliveryUnit>> Handle(GetDeliveryUnitsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };
        var (DUs, totalCount) = await _unitOfWork.DeliveryUnitRepository.GetAllAsync(sieveModel, cancellationToken: cancellationToken);
        return new PaginatedApiResponse<Domain.Entities.Planning.DeliveryUnit>(
            [.. DUs],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}

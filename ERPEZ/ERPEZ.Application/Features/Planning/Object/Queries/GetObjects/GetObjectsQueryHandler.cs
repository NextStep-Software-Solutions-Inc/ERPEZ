using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Object.Queries.GetObjects;

public class GetObjectsQueryHandler(IUnitOfWork _unitOfWork) : IRequestHandler<GetObjectsQuery, PaginatedApiResponse<Domain.Entities.Planning.Object>>
{
    public async Task<PaginatedApiResponse<Domain.Entities.Planning.Object>> Handle(GetObjectsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };
        var (objectives, totalCount) = await _unitOfWork.ObjectRepository.GetAllAsync(sieveModel, cancellationToken: cancellationToken);
        return new PaginatedApiResponse<Domain.Entities.Planning.Object>(
            [.. objectives],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
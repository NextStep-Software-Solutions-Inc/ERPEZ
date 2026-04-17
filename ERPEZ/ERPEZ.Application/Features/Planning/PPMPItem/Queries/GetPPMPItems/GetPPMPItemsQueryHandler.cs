using ERPEZ.Application.Features.Planning.PPMPItem.Dtos;
using ERPEZ.Application.Features.Planning.PPMP.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;
using Sieve.Services;

namespace ERPEZ.Application.Features.Planning.PPMPItem.Queries.GetPPMPItems;

public class GetPPMPItemsQueryHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<GetPPMPItemsQuery, PaginatedApiResponse<PPMPItemResponse>>
{
    public async Task<PaginatedApiResponse<PPMPItemResponse>> Handle(
        GetPPMPItemsQuery query, 
        CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            Page = query.PageNumber,
            PageSize = query.PageSize,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        var (items, totalCount) = await unitOfWork.PPMPItemRepository.GetDetailedPagedAsync(sieveModel, cancellationToken);

        return new PaginatedApiResponse<PPMPItemResponse>(items.Select(item => PPMPResponseMapper.MapItem(item)).ToList(), totalCount, query.PageNumber, query.PageSize);
    }
}

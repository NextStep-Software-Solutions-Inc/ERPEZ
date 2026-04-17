using ERPEZ.Application.Features.Planning.PPMPItemAllocation.Dtos;
using ERPEZ.Application.Features.Planning.PPMP.Queries.Common;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;

namespace ERPEZ.Application.Features.Planning.PPMPItemAllocation.Queries.GetPPMPItemAllocations;

public class GetPPMPItemAllocationsQueryHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<GetPPMPItemAllocationsQuery, PaginatedApiResponse<PPMPItemAllocationResponse>>
{
    public async Task<PaginatedApiResponse<PPMPItemAllocationResponse>> Handle(
        GetPPMPItemAllocationsQuery query, 
        CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            Page = query.PageNumber,
            PageSize = query.PageSize,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        var (allocations, totalCount) = await unitOfWork.PPMPItemAllocationRepository.GetDetailedPagedAsync(sieveModel, cancellationToken);

        return new PaginatedApiResponse<PPMPItemAllocationResponse>(allocations.Select(PPMPQueryProjection.BuildAllocationResponse).ToList(), totalCount, query.PageNumber, query.PageSize);
    }
}

using ERPEZ.Application.Features.Planning.PPMPItemAllocation.Dtos;
using ERPEZ.Application.Features.Planning.PPMP.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;
using Sieve.Services;

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

        return new PaginatedApiResponse<PPMPItemAllocationResponse>(allocations.Select(allocation => PPMPResponseMapper.MapAllocation(allocation)).ToList(), totalCount, query.PageNumber, query.PageSize);
    }
}

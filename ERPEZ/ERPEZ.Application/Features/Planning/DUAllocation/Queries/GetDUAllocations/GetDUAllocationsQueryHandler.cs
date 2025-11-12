using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUAllocation.Queries.GetDUAllocations;

public class GetDUAllocationsQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetDUAllocationsQuery, PaginatedApiResponse<Domain.Entities.Planning.DUAllocation>>
{
    public async Task<PaginatedApiResponse<Domain.Entities.Planning.DUAllocation>> Handle(GetDUAllocationsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };
        var (duallocations, totalCount) = await unitOfWork.DUAllocationRepository.GetAllAsync(sieveModel, cancellationToken: cancellationToken);
        return new PaginatedApiResponse<Domain.Entities.Planning.DUAllocation>(
            [.. duallocations],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}

using ERPEZ.Application.Features.Planning.DUAllocation.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUAllocation.Queries.GetDUAllocations;

public class GetDUAllocationsQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetDUAllocationsQuery, PaginatedApiResponse<DUAllocationResponse>>
{
    public async Task<PaginatedApiResponse<DUAllocationResponse>> Handle(GetDUAllocationsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };
        var (duallocations, totalCount) = await unitOfWork.DUAllocationRepository.GetAllAsync(sieveModel, cancellationToken: cancellationToken);
        var dtos = duallocations.Select(du => new DUAllocationResponse
        {
            Id = du.Id,
            DeliveryUnitId = du.DeliveryUnitId,
            Purpose = du.Purpose,
            Amount = du.Amount,
            IsLocked = du.IsLocked,
        }).ToList();
        return new PaginatedApiResponse<DUAllocationResponse>(
            dtos,
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}

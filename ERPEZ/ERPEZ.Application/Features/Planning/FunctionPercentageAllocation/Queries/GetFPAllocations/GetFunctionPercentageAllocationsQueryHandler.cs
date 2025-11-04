using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Queries.GetFPAllocations;

public class GetFunctionPercentageAllocationsQueryHandler(IUnitOfWork _unitOfWork) : IRequestHandler<GetFunctionPercentageAllocationsQuery, PaginatedApiResponse<Domain.Entities.Planning.FunctionPercentageAllocation>>
{
    public async Task<PaginatedApiResponse<Domain.Entities.Planning.FunctionPercentageAllocation>> Handle(GetFunctionPercentageAllocationsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };
        var (fpas, totalCount) = await _unitOfWork.FunctionPercentageAllocationRepository.GetAllAsync(sieveModel, cancellationToken: cancellationToken);
        return new PaginatedApiResponse<Domain.Entities.Planning.FunctionPercentageAllocation>(
            [.. fpas],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}

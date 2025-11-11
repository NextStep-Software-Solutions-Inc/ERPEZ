using ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FunctionPercentageAllocation.Queries.GetFPAllocations;

public class GetFunctionPercentageAllocationsQueryHandler(IUnitOfWork _unitOfWork) : IRequestHandler<GetFunctionPercentageAllocationsQuery, PaginatedApiResponse<FunctionPercentageAllocationResponse>>
{
    public async Task<PaginatedApiResponse<FunctionPercentageAllocationResponse>> Handle(GetFunctionPercentageAllocationsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };
        var (fpas, totalCount) = await _unitOfWork.FunctionPercentageAllocationRepository.GetAllAsync(sieveModel, cancellationToken: cancellationToken);

        var res = fpas.Select(fpa => new FunctionPercentageAllocationResponse
        {
            Id = fpa.Id,
            FiscalYear = fpa.FiscalYear,
            FunctionType = fpa.FunctionType,
            Description = fpa.Description,
            Percentage = fpa.Percentage,
            CreatedAt = fpa.CreatedAt,
            CreatedBy = fpa.CreatedBy
        }).ToList();

        return new PaginatedApiResponse<FunctionPercentageAllocationResponse>(
            [.. res],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}

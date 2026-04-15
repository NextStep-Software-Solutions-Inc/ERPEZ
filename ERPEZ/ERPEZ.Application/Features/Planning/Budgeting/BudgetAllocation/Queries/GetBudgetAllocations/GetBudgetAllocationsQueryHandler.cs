using ERPEZ.Application.Features.Planning.Budgeting.BudgetAllocation.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;

namespace ERPEZ.Application.Features.Planning.Budgeting.BudgetAllocation.Queries.GetBudgetAllocations;

public class GetBudgetAllocationsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetBudgetAllocationsQuery, PaginatedApiResponse<BudgetAllocationResponse>>
{
    public async Task<PaginatedApiResponse<BudgetAllocationResponse>> Handle(GetBudgetAllocationsQuery request, CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            Page = request.PageNumber,
            PageSize = request.PageSize,
            Filters = request.Filters,
            Sorts = request.Sorts
        };

        var (entities, totalCount) = await unitOfWork.BudgetAllocationRepository
            .GetAllWithDetailsAsync(sieveModel, cancellationToken);

        var items = entities.Select(entity => new BudgetAllocationResponse
        {
            Id = entity.Id,
            LineItemBudgetDetailId = entity.LineItemBudgetDetailId,
            BudgetPeriod = entity.BudgetPeriod,
            StartDate = entity.StartDate,
            EndDate = entity.EndDate,
            TotalAllocated = entity.TotalAllocated,
            LineItemBudgetDetail = entity.LineItemBudgetDetail == null ? null : new BudgetAllocationLineItemDetailResponse
            {
                Id = entity.LineItemBudgetDetail.Id,
                Description = entity.LineItemBudgetDetail.Description,
                Budget = entity.LineItemBudgetDetail.Budget
            }
        }).ToList();

        return new PaginatedApiResponse<BudgetAllocationResponse>(items, request.PageNumber, request.PageSize, totalCount);
    }
}

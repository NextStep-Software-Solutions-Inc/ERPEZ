using ERPEZ.Application.Features.Planning.Budgeting.BudgetAllocation.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.BudgetAllocation.Queries.GetBudgetAllocationById;

public class GetBudgetAllocationByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetBudgetAllocationByIdQuery, ApiResponse<BudgetAllocationResponse>>
{
    public async Task<ApiResponse<BudgetAllocationResponse>> Handle(GetBudgetAllocationByIdQuery query, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.BudgetAllocationRepository.GetByIdWithDetailsAsync(query.Id, cancellationToken)
            ?? throw new NotFoundException($"Budget Allocation with ID {query.Id} not found.");

        var item = new BudgetAllocationResponse
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
        };

        return ApiResponse<BudgetAllocationResponse>.Success(item);
    }
}

using ERPEZ.Application.Features.Planning.Budgeting.BudgetAllocation.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.BudgetAllocation.Queries.GetBudgetAllocations;

public record GetBudgetAllocationsQuery : IRequest<PaginatedApiResponse<BudgetAllocationResponse>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? Filters { get; init; }
    public string? Sorts { get; init; }
}

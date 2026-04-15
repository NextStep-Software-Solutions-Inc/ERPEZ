using ERPEZ.Application.Features.Planning.Budgeting.BudgetAllocation.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.BudgetAllocation.Queries.GetBudgetAllocationById;

public record GetBudgetAllocationByIdQuery(Guid Id) : IRequest<ApiResponse<BudgetAllocationResponse>>;

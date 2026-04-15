using ERPEZ.Application.Features.Planning.Budgeting.BudgetAllocation.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.BudgetAllocation.Commands.UpdateBudgetAllocation;

public record UpdateBudgetAllocationCommand(Guid Id, UpdateBudgetAllocationRequest Request) : IRequest<ApiResponse<Unit>>;

using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.BudgetAllocation.Commands.DeleteBudgetAllocation;

public record DeleteBudgetAllocationCommand(Guid Id) : IRequest<ApiResponse<Unit>>;

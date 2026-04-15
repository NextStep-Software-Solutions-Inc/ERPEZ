using ERPEZ.Application.Features.Planning.Budgeting.BudgetAllocation.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.BudgetAllocation.Commands.CreateBudgetAllocation;

public record CreateBudgetAllocationCommand(CreateBudgetAllocationRequest Request) : IRequest<ApiResponse<Guid>>;

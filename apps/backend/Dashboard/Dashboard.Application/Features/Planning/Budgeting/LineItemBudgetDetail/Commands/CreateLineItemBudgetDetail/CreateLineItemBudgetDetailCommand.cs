using ERPEZ.Application.Features.Planning.Budgeting.Common;
using ERPEZ.Application.Features.Planning.Budgeting.LineItemBudgetDetail.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.LineItemBudgetDetail.Commands.CreateLineItemBudgetDetail;

public record CreateLineItemBudgetDetailCommand(CreateLineItemBudgetDetailRequest Request) : IRequest<ApiResponse<Guid>>;





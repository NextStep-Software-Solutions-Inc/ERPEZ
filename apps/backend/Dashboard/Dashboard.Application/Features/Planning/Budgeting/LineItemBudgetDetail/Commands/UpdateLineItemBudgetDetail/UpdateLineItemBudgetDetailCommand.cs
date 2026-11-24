using ERPEZ.Application.Features.Planning.Budgeting.Common;
using ERPEZ.Application.Features.Planning.Budgeting.LineItemBudgetDetail.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.LineItemBudgetDetail.Commands.UpdateLineItemBudgetDetail;

public record UpdateLineItemBudgetDetailCommand(Guid Id, UpdateLineItemBudgetDetailRequest Request) : IRequest<ApiResponse<Unit>>;





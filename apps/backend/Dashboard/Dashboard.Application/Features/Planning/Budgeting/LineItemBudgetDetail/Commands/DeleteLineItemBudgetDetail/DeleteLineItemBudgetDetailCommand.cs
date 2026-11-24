using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.LineItemBudgetDetail.Commands.DeleteLineItemBudgetDetail;

public record DeleteLineItemBudgetDetailCommand(Guid Id) : IRequest<ApiResponse<Unit>>;





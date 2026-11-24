using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.BudgetCall.Commands.DeleteBudgetCall;

public record DeleteBudgetCallCommand(Guid Id) : IRequest<ApiResponse<Unit>>;

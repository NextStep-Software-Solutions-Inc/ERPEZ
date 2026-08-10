using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.BudgetCall.Commands.ChangeBudgetCallStatus;

public record ChangeBudgetCallStatusCommand(Guid Id, string Status) : IRequest<ApiResponse<Unit>>;

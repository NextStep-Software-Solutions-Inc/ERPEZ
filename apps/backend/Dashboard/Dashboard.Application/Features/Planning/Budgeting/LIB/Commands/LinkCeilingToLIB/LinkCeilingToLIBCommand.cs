using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIB.Commands.LinkCeilingToLIB;

public record LinkCeilingToLIBCommand(Guid LIBId, Guid AgencyMasterBudgetId) : IRequest<ApiResponse<Unit>>;

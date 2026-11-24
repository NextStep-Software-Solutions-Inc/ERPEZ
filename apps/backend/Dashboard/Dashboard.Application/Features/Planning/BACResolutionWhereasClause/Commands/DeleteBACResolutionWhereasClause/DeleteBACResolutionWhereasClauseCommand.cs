using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.BACResolutionWhereasClause.Commands.DeleteBACResolutionWhereasClause;

public record DeleteBACResolutionWhereasClauseCommand(Guid Id) : IRequest<ApiResponse<Unit>>;

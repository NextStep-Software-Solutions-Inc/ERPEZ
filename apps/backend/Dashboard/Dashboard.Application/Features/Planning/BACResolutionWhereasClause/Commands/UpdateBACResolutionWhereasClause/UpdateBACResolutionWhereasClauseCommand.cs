using ERPEZ.Application.Features.Planning.BACResolutionWhereasClause.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.BACResolutionWhereasClause.Commands.UpdateBACResolutionWhereasClause;

public record UpdateBACResolutionWhereasClauseCommand : IRequest<ApiResponse<Unit>>
{
    public required Guid Id { get; init; }
    public required UpdateBACResolutionWhereasClauseRequest UpdateWhereasClause { get; init; }
}

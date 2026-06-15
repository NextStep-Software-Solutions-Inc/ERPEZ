using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.BACResolutionWhereasClause.Commands.CreateBACResolutionWhereasClause;

public record CreateBACResolutionWhereasClauseCommand : IRequest<ApiResponse<Guid>>
{
    public required string Name { get; init; }
    public required string Body { get; init; }
}

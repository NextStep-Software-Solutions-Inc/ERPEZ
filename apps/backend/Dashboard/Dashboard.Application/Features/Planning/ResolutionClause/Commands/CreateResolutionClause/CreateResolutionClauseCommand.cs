using System;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ResolutionClause.Commands.CreateResolutionClause;

public record CreateResolutionClauseCommand : IRequest<ApiResponse<Guid>>
{
    public required string Name { get; init; }
    public required string Body { get; init; }
    public string ClauseType { get; init; } = "Whereas";
}

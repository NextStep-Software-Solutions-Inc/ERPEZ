using System;

namespace ERPEZ.Application.Features.Planning.ResolutionClause.Dtos;

public record ResolutionClauseResponse
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Body { get; init; } = string.Empty;
    public string ClauseType { get; init; } = "Whereas";
}

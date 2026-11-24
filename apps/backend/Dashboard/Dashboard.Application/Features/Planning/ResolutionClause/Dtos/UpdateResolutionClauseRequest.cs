namespace ERPEZ.Application.Features.Planning.ResolutionClause.Dtos;

public record UpdateResolutionClauseRequest
{
    public string? Name { get; init; }
    public string? Body { get; init; }
    public string? ClauseType { get; init; }
}

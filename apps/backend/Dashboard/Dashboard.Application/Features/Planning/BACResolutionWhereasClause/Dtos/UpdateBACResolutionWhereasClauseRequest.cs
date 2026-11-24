namespace ERPEZ.Application.Features.Planning.BACResolutionWhereasClause.Dtos;

public record UpdateBACResolutionWhereasClauseRequest
{
    public string? Name { get; init; }
    public string? Body { get; init; }
}

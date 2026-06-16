namespace ERPEZ.Application.Features.Planning.BACResolutionWhereasClause.Dtos;

public record BACResolutionWhereasClauseResponse
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Body { get; init; } = string.Empty;
}

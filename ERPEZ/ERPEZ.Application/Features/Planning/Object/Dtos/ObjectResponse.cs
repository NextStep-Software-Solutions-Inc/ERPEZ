namespace ERPEZ.Application.Features.Planning.Object.Dtos;

public record ObjectResponse
{
    public Guid Id { get; init; }
    public ObjectResponse? Parent { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Code { get; init; } = string.Empty;
    public bool IsActive { get; init; }

    public int ChildObjectCount { get; init; } = 0;
    public int WFPObjectiveActivityExpenditureCount { get; init; } = 0;
    public int TransactionCount { get; init; } = 0;
}

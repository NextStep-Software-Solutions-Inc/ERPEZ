namespace ERPEZ.Application.Features.Planning.Budgeting.LIB.Dtos;

public record LIBVersionHistoryResponse
{
    public Guid Id { get; init; }
    public string LIBNumber { get; init; } = string.Empty;
    public int Version { get; init; }
    public string Status { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
    public decimal TotalAmount { get; init; }
}

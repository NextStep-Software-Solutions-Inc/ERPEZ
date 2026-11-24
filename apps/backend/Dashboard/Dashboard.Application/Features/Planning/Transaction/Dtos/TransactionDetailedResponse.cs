namespace ERPEZ.Application.Features.Planning.Transaction.Dtos;

public record TransactionDetailedResponse
{
    public Guid Id { get; init; }
    public string? Description { get; init; }
    public decimal Amount { get; init; }
    public DateTime TransactionDate { get; init; }
    public string? TransactionType { get; init; }
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
    public DateTime? UpdatedAt { get; init; }
    public string? UpdatedBy { get; init; }
}

namespace ERPEZ.Domain.Dtos.Finance;

public record AccountTransactionResponse
{
    public Guid Id { get; init; }
    public Guid FromAccountId { get; init; }
    public AccountSummaryResponse FromAccount { get; init; } = null!;
    public Guid ToAccountId { get; init; }
    public AccountSummaryResponse ToAccount { get; init; } = null!;
    public string Purpose { get; init; } = string.Empty;
    public decimal AmountTransfer { get; init; }
    public int Code { get; init; }
    public DateTime TransactionDate { get; init; }
    public string Status { get; init; } = string.Empty;
    public Guid? AuthorizedByUserId { get; init; }
    public DateTime? AuthorizedDate { get; init; }
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
    public DateTime? UpdatedAt { get; init; }
    public string? UpdatedBy { get; init; }
}

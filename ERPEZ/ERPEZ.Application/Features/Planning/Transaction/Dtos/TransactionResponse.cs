namespace ERPEZ.Application.Features.Planning.Transaction.Dtos;

public record TransactionResponse
{
    public Guid Id { get; init; }
    public Guid FundSourceId { get; init; }
    public Guid OrganizationId { get; init; }
    public Guid LocationId { get; init; }
    public Guid MFOPAPId { get; init; }
    public Guid ObjectId { get; init; }
    public DateTime TransactionDate { get; init; }
    public decimal AllotedAmount { get; init; }
    public decimal? ObligatedAmount { get; init; }
    public decimal? DisbursementAmount { get; init; }
}

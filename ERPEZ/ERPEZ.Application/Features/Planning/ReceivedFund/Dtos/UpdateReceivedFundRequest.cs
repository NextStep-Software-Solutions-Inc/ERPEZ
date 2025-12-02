namespace ERPEZ.Application.Features.Planning.ReceivedFund.Dtos;

public record UpdateReceivedFundRequest
{
    public decimal Amount { get; init; }
    public DateTime ReceivedDate { get; init; }
    public string? Description { get; init; }
}

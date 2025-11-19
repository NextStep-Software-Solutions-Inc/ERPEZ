namespace ERPEZ.Application.Features.Planning.ReceivedFund.Dtos;

public class ReceivedFundDto
{
    public Guid Id { get; set; }
    public Guid FundSourceId { get; set; }
    public decimal Amount { get; set; }
}

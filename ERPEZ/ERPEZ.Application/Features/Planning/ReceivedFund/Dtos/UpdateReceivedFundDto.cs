namespace ERPEZ.Application.Features.Planning.ReceivedFund.Dtos;

public class UpdateReceivedFundDto
{
    public Guid? FundSourceId { get; set; }
    public decimal? Amount { get; set; }
}

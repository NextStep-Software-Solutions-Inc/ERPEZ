namespace ERPEZ.Application.Features.Planning.ReceivedFund.Dtos;

public class UpdateReceivedFundDto
{
    public decimal Amount { get; set; }
    public DateTime ReceivedDate { get; set; }
    public string? Description { get; set; }
}

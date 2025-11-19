namespace ERPEZ.Application.Features.Planning.DUFundAllocation.Dtos;

public class DUFundAllocationDto
{
    public Guid Id { get; set; }
    public Guid DUAllocationId { get; set; }
    public Guid ReceivedFundId { get; set; }
    public decimal Amount { get; set; }
}

namespace ERPEZ.Application.Features.Planning.DUFundAllocation.Dtos;

public class UpdateDUFundAllocationDto
{
    public Guid? DUAllocationId { get; set; }
    public Guid? ReceivedFundId { get; set; }
    public decimal? Amount { get; set; }
}

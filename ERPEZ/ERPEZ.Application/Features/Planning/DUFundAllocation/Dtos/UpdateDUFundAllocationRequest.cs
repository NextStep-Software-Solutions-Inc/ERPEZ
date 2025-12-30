namespace ERPEZ.Application.Features.Planning.DUFundAllocation.Dtos;

public record UpdateDUFundAllocationRequest
{
    public Guid? DUAllocationId { get; init; }
    public Guid? ReceivedFundId { get; init; }
    public decimal? Amount { get; init; }
}

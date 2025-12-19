using ERPEZ.Application.Features.Planning.ReceivedFund.Dtos;

namespace ERPEZ.Application.Features.Planning.DUFundAllocation.Dtos;

public record DUFundAllocationResponse
{
    public Guid Id { get; set; }
    public Guid DUAllocationId { get; set; }
    public required decimal Amount { get; set; }
    public required ReceivedFundResponse ReceivedFund { get; init; }
}

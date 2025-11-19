using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUAllocation.Commands.CreateDUAllocation;

public record CreateDUAllocationCommand : IRequest<ApiResponse<Guid>>
{
    public required Guid DeliveryUnitId { get; init; }
    public string Purpose { get; init; } = string.Empty;
    public required decimal Amount { get; init; }
    public List<DUFundAllocationRequest> DUFundAllocations { get; init; } = [];
}

public record DUFundAllocationRequest
{
    public required Guid ReceivedFundId { get; init; }
    public required decimal Amount { get; init; }
}

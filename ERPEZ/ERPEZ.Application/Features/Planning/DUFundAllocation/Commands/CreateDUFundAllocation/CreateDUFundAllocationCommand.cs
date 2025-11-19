using ERPEZ.Application.Features.Planning.DUFundAllocation.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUFundAllocation.Commands.CreateDUFundAllocation;

public record CreateDUFundAllocationCommand : IRequest<ApiResponse<DUFundAllocationDto>>
{
    public Guid DUAllocationId { get; init; }
    public Guid ReceivedFundId { get; init; }
    public decimal Amount { get; init; }
}

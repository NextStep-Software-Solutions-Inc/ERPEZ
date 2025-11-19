using ERPEZ.Application.Features.Planning.DUFundAllocation.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUFundAllocation.Commands.CreateDUFundAllocation;

public class CreateDUFundAllocationCommand : IRequest<ApiResponse<DUFundAllocationDto>>
{
    public Guid DUAllocationId { get; set; }
    public Guid ReceivedFundId { get; set; }
    public decimal Amount { get; set; }
}

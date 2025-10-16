using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DUAllocation.Commands.CreateDUAllocation;

public class CreateDUAllocationCommand : IRequest<ApiResponse<Domain.Entities.Planning.DUAllocation>>
{
    public Guid ReceivedFundId { get; set; }
    public Guid DeliveryUnitId { get; set; }
    public string Purpose { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}
using ERPEZ.Shared.Common;
using MediatR;
using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Planning.PPMPItemAllocation.Commands.CreatePPMPItemAllocation;

public record CreatePPMPItemAllocationCommand : IRequest<ApiResponse<Guid>>
{
    public Guid PPMPItemId { get; init; }
    public AllocationMonthEnum AllocationMonth { get; init; }
    public int Quantity { get; init; }
}

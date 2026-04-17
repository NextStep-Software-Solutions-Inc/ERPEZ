using ERPEZ.Shared.Common;
using MediatR;
using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Planning.PPMPItemAllocation.Commands.UpdatePPMPItemAllocation;

public record UpdatePPMPItemAllocationCommand : IRequest<ApiResponse<Guid>>
{
    public Guid Id { get; init; }
    public AllocationMonthEnum? AllocationMonth { get; init; }
    public int? Quantity { get; init; }
}

using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Planning.PPMPItemAllocation.Dtos;

public record UpdatePPMPItemAllocationRequest
{
    public AllocationMonthEnum? AllocationMonth { get; init; }
    public int? Quantity { get; init; }
}

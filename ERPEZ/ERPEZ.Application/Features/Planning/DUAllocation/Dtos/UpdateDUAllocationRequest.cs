using ERPEZ.Application.Features.Planning.DUAllocation.Commands.CreateDUAllocation;

namespace ERPEZ.Application.Features.Planning.DUAllocation.Dtos;

public record UpdateDUAllocationRequest
{
    public string? Purpose { get; init; }
    public decimal? Amount { get; init; }
    public List<DUFundAllocationRequest>? DUFundAllocations { get; init; } = [];
}

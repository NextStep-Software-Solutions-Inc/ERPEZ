using ERPEZ.Application.Features.Planning.DeliveryUnit.Dtos;
using ERPEZ.Application.Features.Planning.DUFundAllocation.Dtos;

namespace ERPEZ.Application.Features.Planning.DUAllocation.Dtos;

public record DUAllocationDetailedResponse
{
    public Guid Id { get; init; }
    public required DeliveryUnitResponse DeliveryUnit { get; init; }
    public string Purpose { get; init; } = string.Empty;
    public decimal Amount { get; init; }
    public bool IsLocked { get; init; }
    public DateTime CreatedAt { get; init; }
    public List<DUFundAllocationResponse> FundAllocations { get; init; } = [];
}
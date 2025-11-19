using ERPEZ.Application.Features.Planning.DUAllocation.Commands.CreateDUAllocation;

namespace ERPEZ.Application.Features.Planning.DUAllocation.Dtos;

public class UpdateDUAllocationRequest
{
    public string? Purpose { get; set; }
    public decimal? Amount { get; set; }
    public List<DUFundAllocationRequest>? DUFundAllocations { get; set; } = [];
}

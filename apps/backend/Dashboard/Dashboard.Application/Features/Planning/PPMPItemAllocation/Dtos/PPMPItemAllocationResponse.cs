using ERPEZ.Domain.Enums;
using System.Text.Json.Serialization;
using ERPEZ.Application.Features.Planning.PPMPItem.Dtos;
using ERPEZ.Application.Features.Planning.PPMP.Dtos;

namespace ERPEZ.Application.Features.Planning.PPMPItemAllocation.Dtos;

public record PPMPItemAllocationResponse
{
    public Guid Id { get; init; }
    public Guid PPMPItemId { get; init; }
    public AllocationMonthEnum AllocationMonth { get; init; }
    public int Quantity { get; init; }
    public decimal Amount { get; init; }
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;

    [JsonPropertyName("PPMPItem")]
    public PPMPItemResponse? PPMPItem { get; init; }

    [JsonPropertyName("PPMP")]
    public PPMPResponse? PPMP { get; init; }
}

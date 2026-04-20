using ERPEZ.Application.Features.Planning.PPMPItemAllocation.Dtos;
using ERPEZ.Application.Features.Planning.PPMP.Dtos;
using ERPEZ.Application.Features.Planning.NonCSEItem.Dtos;
using System.Text.Json.Serialization;

namespace ERPEZ.Application.Features.Planning.PPMPItem.Dtos;

public record PPMPItemResponse
{
    public Guid Id { get; init; }
    public Guid PPMPExpenditureItemId { get; init; }
    public Guid? CSEItemId { get; init; }
    public Guid? NonCSEItemId { get; init; }
    public Guid ProcurementModeId { get; init; }
    public List<string>? PAPCode { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string Unit { get; init; } = string.Empty;
    public decimal UnitPrice { get; init; }
    public bool MOPOverride { get; init; }
    public string? MOPJustification { get; init; }
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;

    [JsonPropertyName("PPMP")]
    public PPMPResponse? PPMP { get; init; }

    [JsonPropertyName("PPMPItemAllocationTotalAmount")]
    public decimal TotalAllocationAmount { get; init; }
    
    [JsonPropertyName("PPMPItemAllocations")]
    public List<PPMPItemAllocationResponse> PPMPItemAllocations { get; init; } = [];
    
    public string? CSEItemName { get; init; }
    public string? NonCSEItemName { get; init; }
    public string ProcurementModeName { get; init; } = string.Empty;

    [JsonPropertyName("NonCSEItem")]
    public NonCSEItemResponse? NonCSEItem { get; init; }
}

using ERPEZ.Application.Features.Planning.NonCSEItem.Dtos;
using ERPEZ.Application.Features.Planning.PPMP.Dtos;
using ERPEZ.Application.Features.Planning.PPMPItemAllocation.Dtos;
using ERPEZ.Domain.Enums;
using System.Text.Json.Serialization;

namespace ERPEZ.Application.Features.Planning.PPMPItem.Dtos;

public record PPMPItemResponse
{
    public Guid    Id                    { get; init; }
    public Guid    PPMPExpenditureItemId { get; init; }
    public Guid?   CSEItemId             { get; init; }
    public Guid?   NonCSEItemId          { get; init; }
    public Guid    ProcurementModeId     { get; init; }
    public string? PAPCode               { get; init; }
    public string  Name                  { get; init; } = string.Empty;
    public string? Description           { get; init; }
    public string  Unit                  { get; init; } = string.Empty;
    public decimal UnitPrice             { get; init; }
    public bool    MOPOverride           { get; init; }
    public string? MOPJustification      { get; init; }
    public DateTime CreatedAt            { get; init; }
    public string   CreatedBy            { get; init; } = string.Empty;

    // ── New scheduling & project type fields ─────────────────────────────────
    public ProcurementProjectType  ProjectType              { get; init; }
    public bool?    PreProcurementConference                { get; init; }
    public DateOnly? ProcurementStartDate                   { get; init; }
    public DateOnly? ProcurementEndDate                     { get; init; }
    public DateOnly? ExpectedDeliveryStart                  { get; init; }
    public DateOnly? ExpectedDeliveryEnd                    { get; init; }
    public string?  Remarks                                 { get; init; }

    // ── Navigations & computed ───────────────────────────────────────────────
    [JsonPropertyName("PPMP")]
    public PPMPResponse? PPMP { get; init; }

    [JsonPropertyName("PPMPItemAllocationTotalAmount")]
    public decimal TotalAllocationAmount { get; init; }

    [JsonPropertyName("PPMPItemAllocations")]
    public List<PPMPItemAllocationResponse> PPMPItemAllocations { get; init; } = [];

    public string?            CSEItemName        { get; init; }
    public string?            NonCSEItemName      { get; init; }
    public string             ProcurementModeName { get; init; } = string.Empty;

    [JsonPropertyName("NonCSEItem")]
    public NonCSEItemResponse? NonCSEItem { get; init; }
}
using ERPEZ.Application.Features.Planning.PPMPItem.Dtos;
using ERPEZ.Application.Features.Planning.PPMPItemAllocation.Dtos;
using System.Text.Json.Serialization;

namespace ERPEZ.Application.Features.Planning.PPMP.Dtos;

public record PPMPDetailedResponse
{
    public Guid Id { get; init; }
    public string PPMPNumber { get; init; } = string.Empty;
    public Guid OfficeId { get; init; }
    public string OfficeName { get; init; } = string.Empty;
    public Guid FiscalYearId { get; init; }
    public string FiscalYearName { get; init; } = string.Empty;
    public Guid? FundSourceId { get; init; }
    public string? FundSourceName { get; init; }
    public Guid? LIBId { get; init; }
    public string? LIBName { get; init; }
    public Guid? ParentId { get; init; }
    public bool IsMaster { get; init; }
    public string? Description { get; init; }
    public int Version { get; init; }
    public decimal TotalEstimatedBudget { get; init; }
    public string Status { get; init; } = string.Empty;
    public DateTime? SubmittedDate { get; init; }
    public DateTime? ApprovedDate { get; init; }
    public Guid? ConsolidatedIntoId { get; init; }
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
    public DateTime? UpdatedAt { get; init; }
    public string? UpdatedBy { get; init; }

    [JsonPropertyName("ParentPPMP")]
    public PPMPResponse? ParentPPMP { get; init; }
    
    [JsonPropertyName("PPMPItems")]
    public List<PPMPItemResponse> PPMPItems { get; init; } = [];

    [JsonPropertyName("PPMPItemAllocations")]
    public List<PPMPItemAllocationResponse> PPMPItemAllocations { get; init; } = [];
    
    [JsonPropertyName("PPMPActivities")]
    public List<PPMPActivityResponse> PPMPActivities { get; init; } = [];
    
    [JsonPropertyName("ApprovalEvents")]
    public List<ApprovalEventResponse> ApprovalEvents { get; init; } = [];
    
    [JsonPropertyName("ChildPPMPs")]
    public List<PPMPResponse> ChildPPMPs { get; init; } = [];
}

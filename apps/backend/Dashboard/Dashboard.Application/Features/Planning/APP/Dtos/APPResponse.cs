using System.Text.Json.Serialization;

namespace ERPEZ.Application.Features.Planning.APP.Dtos;

public record APPResponse
{
    public Guid Id { get; init; }
    public string APPNumber { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public Guid FiscalYearId { get; init; }
    public string FiscalYearName { get; init; } = string.Empty;
    public string APPType { get; init; } = "Indicative";
    public string Batch { get; init; } = "Batch 1";
    public string Quarter { get; init; } = "Q1";
    public int? VersionNumber { get; init; }
    public DateTime? VersionDate { get; init; }
    public Guid? SourceAPPId { get; init; }
    public string IsFinal { get; init; } = string.Empty;
    public string? Remarks { get; init; }
    public string? Description { get; init; }
    public string Status { get; init; } = string.Empty;
    public DateTime? SubmittedDate { get; init; }
    public DateTime? ApprovedDate { get; init; }
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
    public DateTime? UpdatedAt { get; init; }
    public string? UpdatedBy { get; init; }

    [JsonPropertyName("FiscalYear")]
    public APPFiscalYearResponse? FiscalYear { get; init; }

    [JsonPropertyName("APPItems")]
    public List<APPItemSummaryResponse> APPItems { get; init; } = [];

    [JsonPropertyName("APPPPMPs")]
    public List<APPPPMPLinkResponse> APPPPMPs { get; init; } = [];

    [JsonPropertyName("signatories")]
    public APPSignatoriesResponse Signatories { get; init; } = new();
}

public record APPFiscalYearResponse
{
    public Guid Id { get; init; }
    public int Year { get; init; }
    public string Status { get; init; } = string.Empty;
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
}

public record APPOfficeResponse
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Code { get; init; } = string.Empty;
    public string? ResponsibilityCenterCode { get; init; }
    public string? BudgetCostCenter { get; init; }
}

public record APPItemSummaryResponse
{
    public Guid Id { get; init; }
    public Guid PPMPItemId { get; init; }
    public Guid? CSEItemId { get; init; }
    public Guid? NonCSEItemId { get; init; }
    public bool IsCSE { get; init; }
    public bool IsNonCSE { get; init; }
    public string PPMPItemName { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string Unit { get; init; } = string.Empty;
    public int Quantity { get; init; }
    public decimal UnitCost { get; init; }
    public decimal TotalAmount { get; init; }
    public decimal OriginalPPMPBudget { get; init; }
    public decimal EffectiveABC { get; init; }
    public DateTime? EffectiveStartOfProcurement { get; init; }
    public DateTime? EffectiveEndOfProcurement { get; init; }
    public bool IsABCOverridden { get; init; }
    public bool IsStartProcurementOverridden { get; init; }
    public bool IsEndProcurementOverridden { get; init; }
    public Guid ProcurementModeId { get; init; }
    public string ProcurementModeName { get; init; } = string.Empty;
    public Guid FundSourceId { get; init; }
    public string FundSourceName { get; init; } = string.Empty;
    public Guid OfficeId { get; init; }
    public string OfficeName { get; init; } = string.Empty;
    public string PAPCode { get; init; } = string.Empty;
    public string? Remarks { get; init; }
    public bool IsEarlyProcurementActivity { get; init; }
    public string? EPARemarks { get; init; }
    public bool IsOutsourced { get; init; }
    public DateTime? StartOfProcurementOverride { get; init; }
    public DateTime? EndOfProcurementOverride { get; init; }
    public decimal? EstimatedBudgetOverride { get; init; }
    public string? BidEvaluationCriteria { get; init; }
    public List<string> ProcurementStrategies { get; init; } = [];
    public bool IsNew { get; init; }
    public bool IsRevised { get; init; }
    public List<APPItemScheduleSummaryResponse> Schedules { get; init; } = [];
}

public record APPItemScheduleSummaryResponse
{
    public Guid Id { get; init; }
    public Guid ProcurementActivityTypeId { get; init; }
    public string ProcurementActivityTypeName { get; init; } = string.Empty;
    public DateTime? ScheduledDate { get; init; }
    public string? CustomDateText { get; init; }
}

public record APPPPMPLinkResponse
{
    public Guid Id { get; init; }
    public Guid PPMPId { get; init; }

    [JsonPropertyName("PPMP")]
    public APPPPMPPPMPResponse? PPMP { get; init; }
}

public record APPPPMPPPMPResponse
{
    public Guid Id { get; init; }
    public Guid OfficeId { get; init; }
    public string OfficeName { get; init; } = string.Empty;
    public Guid FiscalYearId { get; init; }
    public string FiscalYearYear { get; init; } = string.Empty;
    public Guid? FundSourceId { get; init; }
    public string FundSourceName { get; init; } = string.Empty;
    public string PPMPNumber { get; init; } = string.Empty;
    public string? Description { get; init; }
    public bool IsFinal { get; init; }
    public int Version { get; init; }
    public decimal TotalEstimatedBudget { get; init; }
    public string Status { get; init; } = string.Empty;
}

public record APPSignatoriesResponse
{
    public List<APPSignatoryResponse> PreparedBy { get; init; } = [];
    public List<APPSignatoryResponse> ReviewedBy { get; init; } = [];
    public List<APPSignatoryResponse> ApprovedBy { get; init; } = [];
    public List<APPSignatoryResponse> CertifiedBy { get; init; } = [];
}

public record APPSignatoryResponse
{
    public Guid Id { get; init; }
    public Guid? UserId { get; init; }
    public Guid? PersonnelPositionId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Position { get; init; } = string.Empty;
    public string Department { get; init; } = string.Empty;
    public DateTime? SignatureDate { get; init; }
}

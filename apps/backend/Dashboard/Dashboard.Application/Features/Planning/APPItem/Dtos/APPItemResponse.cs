using System.Text.Json.Serialization;
using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Planning.APPItem.Dtos;

public record APPItemResponse
{
    public Guid Id { get; init; }
    public Guid APPId { get; init; }
    public Guid PPMPItemId { get; init; }
    public string PPMPItemName { get; init; } = string.Empty;
    public string? ItemNameOverride { get; init; }
    public string? GeneralDescription { get; init; }
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
    public BidEvaluationCriteria? BidEvaluationCriteria { get; init; }
    public List<ProcurementStrategy>? ProcurementStrategies { get; init; }
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
    public DateTime? UpdatedAt { get; init; }
    public string? UpdatedBy { get; init; }
    public DateTime? EffectiveStartOfProcurement  { get; init; }
    public DateTime? EffectiveEndOfProcurement  { get; init; }
    public DateTime? StartOfProcurementOverride { get; init; }
    public DateTime? EndOfProcurementOverride { get; init; }
    public decimal? EstimatedBudgetOverride { get; init; }
    public decimal OriginalPPMPBudget { get; init; }
    public decimal EffectiveABC { get; init; }
    public int Quantity { get; init; }
    public decimal UnitCost { get; init; }
    public decimal TotalAmount { get; init; }
    public bool IsABCOverridden { get; init; }
    public bool IsStartProcurementOverridden { get; init; }
    public bool IsEndProcurementOverridden { get; init; }
    public bool IsNew { get; init; }
    public bool IsRevised { get; init; }

    [JsonPropertyName("APP")]
    public APPItemAPPResponse? APP { get; init; }

    [JsonPropertyName("PPMPItem")]
    public APPItemPPMPItemResponse? PPMPItem { get; init; }

    [JsonPropertyName("ProcurementMode")]
    public APPItemProcurementModeResponse? ProcurementMode { get; init; }

    [JsonPropertyName("FundSource")]
    public APPItemFundSourceResponse? FundSource { get; init; }

    [JsonPropertyName("Office")]
    public APPItemOfficeResponse? Office { get; init; }

    [JsonPropertyName("Schedules")]
    public List<APPItemScheduleReferenceResponse> Schedules { get; init; } = [];
}

public record APPItemAPPResponse
{
    public Guid Id { get; init; }
    public string APPNumber { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
}

public record APPItemPPMPItemResponse
{
    public Guid Id { get; init; }
    public string? PAPCode { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string Unit { get; init; } = string.Empty;
    public decimal UnitPrice { get; init; }
    public int Quantity { get; init; }
    public decimal TotalAmount { get; init; }
}

public record APPItemProcurementModeResponse
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
}

public record APPItemFundSourceResponse
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Code { get; init; } = string.Empty;
}

public record APPItemOfficeResponse
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Code { get; init; } = string.Empty;
}

public record APPItemScheduleReferenceResponse
{
    public Guid Id { get; init; }
    public Guid ProcurementActivityTypeId { get; init; }
    public string ProcurementActivityTypeName { get; init; } = string.Empty;
    public DateTime? ScheduledDate { get; init; }
    public string? CustomDateText { get; init; }
}

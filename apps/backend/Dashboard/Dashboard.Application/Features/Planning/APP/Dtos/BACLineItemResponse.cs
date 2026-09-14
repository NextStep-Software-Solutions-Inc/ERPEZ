namespace ERPEZ.Application.Features.Planning.APP.Dtos;

public record BACResponse
{
    public List<BACUnitGroupResponse> AggregationsByUnit { get; init; } = [];
    public List<BACProcurementDetailResponse> ProcurementDetails { get; init; } = [];
    public List<BACLineItemResponse> LineItems { get; init; } = [];
    public BACSignatoriesResponse Signatories { get; init; } = new();
}

public record BACUnitGroupResponse
{
    public string Unit { get; init; } = string.Empty;
    public List<BACUnitItemResponse> Items { get; init; } = [];
}

public record BACUnitItemResponse
{
    public string PPMPCode { get; init; } = string.Empty;
    public string ItemName { get; init; } = string.Empty;
    public int Quantity { get; init; }
    public decimal Amount { get; init; }
    public decimal TotalAmount { get; init; }
}

public record BACProcurementDetailResponse
{
    public decimal TotalBudget { get; init; }
    public List<string> FundSources { get; init; } = [];
    public decimal TotalMOOE { get; init; }
    public decimal TotalCapitalOutlay { get; init; }
    public List<string> Offices { get; init; } = [];
    public List<string> ModesOfProcurement { get; init; } = [];
}

public record BACLineItemResponse
{
    public Guid Id { get; init; }
    public string PAPCode { get; init; } = string.Empty;
    public string ItemName { get; init; } = string.Empty;
    public string Unit { get; init; } = string.Empty;
    public int Quantity { get; init; }
    public decimal UnitCost { get; init; }
    public decimal TotalAmount { get; init; }
    public string ModeOfProcurement { get; init; } = string.Empty;
    public string AllotmentClass { get; init; } = string.Empty;
    public List<string> Offices { get; init; } = [];
    public string? Remarks { get; init; }
    public bool EPAEligible { get; init; }
    public List<BACScheduleResponse> Schedules { get; init; } = [];
}

public record BACScheduleResponse
{
    public string MilestoneType { get; init; } = string.Empty;
    public DateTime? ScheduledDate { get; init; }
    public string? CustomDateText { get; init; }
}

public record BACSignatoriesResponse
{
    public List<BACSignatoryResponse> PreparedBy { get; init; } = [];
    public List<BACSignatoryResponse> ReviewedBy { get; init; } = [];
    public List<BACSignatoryResponse> ApprovedBy { get; init; } = [];
    public List<BACSignatoryResponse> CertifiedBy { get; init; } = [];
}

public record BACSignatoryResponse
{
    public string Name { get; init; } = string.Empty;
    public string Position { get; init; } = string.Empty;
}


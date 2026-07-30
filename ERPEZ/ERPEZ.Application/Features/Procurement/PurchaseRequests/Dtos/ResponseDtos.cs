using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Dtos;

public record PRSummaryResponse(
    Guid Id,
    string PRNumber,
    string? Description,
    decimal TotalAmount,
    string Status,
    PRType PRType,
    DateOnly RequestedDate
);

public record PRDetailResponse(
    Guid Id,
    string PRNumber,
    string? Description,
    string Purpose,
    PRType PRType,
    StatusEnum Status,
    DateOnly RequestedDate,
    decimal TotalAmount,
    Guid OfficeId,
    string OfficeName,
    Guid? PPMPId,
    string? PPMPNumber,
    Guid? FundSourceId,
    string? FundSourceName,
    Guid? UACSCodeCombinationId,
    string? UACSCode,
    Guid? ProcurementCategoryId,
    string? ProcurementCategoryName,
    List<PRItemDetailResponse> Items,
    List<ApprovalEventResponse> ApprovalHistory
);

public record PRItemDetailResponse
{
    public Guid     Id                { get; init; }
    public Guid     PPMPItemId        { get; init; }
    public Guid?    APRItemId         { get; init; }
    public string   Name              { get; init; } = string.Empty;
    public string?  Description       { get; init; }
    public string?  StockNo           { get; init; }
    public bool     IsNonCSE          { get; init; }
    public decimal  UnitCost          { get; init; }
    public int      RequestedQuantity { get; init; }
    public decimal  Amount            { get; init; }
    public AllocationMonthEnum RequestedMonth { get; init; }
}

public record ApprovalEventResponse(
    Guid Id,
    string Action,
    string ActorName,
    DateTime Timestamp,
    string? Remarks
);

public record PRWorkspaceSummary(
    decimal TotalPPMPAmount,
    decimal TotalSubmittedPRs,
    decimal AvailableBalance,
    int DraftCount,
    int SubmittedCount,
    int ApprovedCount
);
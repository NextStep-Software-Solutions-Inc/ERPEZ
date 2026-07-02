using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Dtos;

public record ConsolidatedPRSummaryResponse(
    Guid Id,
    string CPRNumber,
    DateOnly ConsolidationDate,
    string? Description,
    string Status
);

public record ConsolidatedPRDetailResponse(
    Guid Id,
    string CPRNumber,
    DateOnly ConsolidationDate,
    string? Description,
    string? Purpose,
    StatusEnum Status,
    decimal TotalAmount,
    List<ConsolidatedPRItemResponse> Items
);

public record ConsolidatedPRItemResponse(
    Guid Id,
    Guid PurchaseRequestId,
    string PRNumber,
    string OfficeName,
    string PRType,
    Guid PRItemId,
    string Name,
    string? Description,
    decimal UnitCost,
    int RequestedQuantity,
    decimal Amount,
    string? StockNo,
    bool IsNonCSE,
    Dictionary<AllocationMonthEnum, int> MonthlyQuantities,
    Guid? ProcurementModeId,
    string? ProcurementModeName,
    bool AllowPartial
);

public record PRSummaryStatsResponse(
    // Image 1 — card 1
    decimal TotalPPMPAmount,            // Sum of approved PPMP budget for this office
    // Image 1 — card 2
    decimal TotalSubmittedPRAmount,     // Sum of PR amounts in Submitted status
    // Image 1 — card 3
    decimal AvailableBalance,           // TotalPPMPAmount - TotalSubmittedPRAmount
    // Image 1 — card 4 (PR Summary breakdown)
    int DraftCount,
    int SubmittedCount,
    int ApprovedCount
);
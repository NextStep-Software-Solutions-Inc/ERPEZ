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
    string? Remarks,
    List<ConsolidatedPRLinkedPrResponse> Prs
);

public record ConsolidatedPRLinkedPrResponse(
    Guid PurchaseRequestId,
    string PRNumber,
    Guid OfficeId,
    string OfficeName,
    string PRType,
    decimal TotalAmount,
    List<ConsolidatedPRItemResponse> Items
);

public record ConsolidatedPRItemResponse(
    Guid PRItemId,
    Guid? ConsolidatedPRItemId,
    string Name,
    string? Description,
    string? Category,
    string? Fund,
    string Unit,
    decimal UnitPrice,
    int TotalQuantity,
    decimal TotalAmount,
    string? StockNo,
    string RequestedMonth,
    Guid? ProcurementModeId,
    bool? AllowPartial
);

public record PRSummaryStatsResponse(
    decimal TotalPPMPAmount,
    decimal TotalSubmittedPRAmount,
    decimal AvailableBalance,
    int DraftCount,
    int SubmittedCount,
    int ApprovedCount
);
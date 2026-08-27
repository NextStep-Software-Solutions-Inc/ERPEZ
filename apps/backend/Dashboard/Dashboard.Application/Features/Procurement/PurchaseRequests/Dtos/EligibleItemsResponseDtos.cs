using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Dtos;

// ── Non-CSE: "Add Office PPMP Items" modal (Image 4) ─────────────────────────

public record EligiblePPMPResponse(
    Guid PPMPId,
    string PPMPNumber,
    Guid OfficeId,
    string OfficeName,
    decimal TotalAmount,
    List<EligiblePPMPItemResponse> Items
);

public record EligiblePPMPItemMonthAllocation(
    AllocationMonthEnum Month,
    int TotalAllocated,
    int AvailableQuantity,
    decimal TotalAvailableAmount
);

public record EligiblePPMPItemResponse(
    Guid PPMPItemId,
    string ItemName,
    string? Description,
    string Category,
    string? ItemCategory,
    string? UacsCode,
    string Fund,
    string Unit,
    decimal UnitPrice,
    bool HasMonthlyAllocations,
    int PlannedQuantity,
    int AvailableQuantity,
    List<EligiblePPMPItemMonthAllocation> MonthlyAllocations,
    decimal TotalAvailableAmount
);

// ── Out-of-Stock CSE: "Add APR Items" modal (Image 9) ────────────────────────

public record EligibleAPRResponse(
    Guid APRId,
    string APRNumber,
    Guid OfficeId,
    string OfficeName,
    decimal TotalAmount,
    List<EligibleAPRItemResponse> Items
);

public record EligibleAPRItemResponse(
    Guid APRItemId,
    string ItemName,
    string Category,
    string Fund,
    string Unit,
    decimal UnitPrice,
    Dictionary<AllocationMonthEnum, int> MonthlyAllocations,
    int TotalRequired,
    int CurrentFulfilled,
    int Deficit
);

// ── Consolidated PR: "Add Agency/Office PR" modal (Image 12) ─────────────────

public record EligiblePRResponse(
    Guid PurchaseRequestId,
    string PRNumber,
    Guid OfficeId,
    string OfficeName,
    string PRType,              // "Non-CSE" | "Out of Stock"
    decimal TotalAmount,
    List<EligiblePRItemResponse> Items
);

public record EligiblePRItemResponse(
    Guid PRItemId,
    string Name,
    string? Description,
    string Category,
    string Fund,
    string Unit,
    decimal UnitPrice,
    int TotalQuantity,
    decimal TotalAmount,
    string? StockNo,
    AllocationMonthEnum RequestedMonth
);
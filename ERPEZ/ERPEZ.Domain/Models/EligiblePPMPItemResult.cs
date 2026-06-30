using ERPEZ.Domain.Enums;

namespace ERPEZ.Domain.Models;

public record EligiblePPMPItemResult(
    Guid    PPMPId,
    string  PPMPNumber,
    Guid    OfficeId,
    string  OfficeName,
    Guid    PPMPItemId,
    string  ItemName,
    string  Category,
    string  Fund,
    string  Unit,
    decimal UnitPrice,
    Dictionary<AllocationMonthEnum, int> MonthlyAllocations,  // ← was Dictionary<int, int>
    int     TotalAllocatedQuantity,
    decimal TotalAllocatedAmount
);

public record EligibleAPRItemResult(
    Guid    APRId,
    string  APRNumber,
    Guid    OfficeId,
    string  OfficeName,
    Guid    APRItemId,
    string  ItemName,
    string  Category,
    string  Fund,
    string  Unit,
    decimal UnitPrice,
    Dictionary<AllocationMonthEnum, int> MonthlyAllocations,
    int     TotalRequired,
    int     CurrentFulfilled,
    int     Deficit
);
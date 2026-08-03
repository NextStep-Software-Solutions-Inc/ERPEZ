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
    AllocationMonthEnum Month,
    int     TotalAllocatedQuantity,
    int     AvailableQuantity,
    decimal TotalAvailableAmount
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
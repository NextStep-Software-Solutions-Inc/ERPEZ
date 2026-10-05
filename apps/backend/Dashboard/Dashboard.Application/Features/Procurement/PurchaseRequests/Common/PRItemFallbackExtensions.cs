using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Common;

/// <summary>
/// Extension methods providing resilient navigation property fallback logic
/// for PRItem and related procurement structures across query handlers.
/// </summary>
public static class PRItemFallbackExtensions
{
    public static string ResolveDescription(this PRItem item)
    {
        if (!string.IsNullOrWhiteSpace(item.Description))
            return item.Description;

        if (!string.IsNullOrWhiteSpace(item.PPMPItem?.Description))
            return item.PPMPItem.Description;

        if (!string.IsNullOrWhiteSpace(item.PPMPItem?.NonCSEItem?.Description))
            return item.PPMPItem.NonCSEItem.Description;

        if (!string.IsNullOrWhiteSpace(item.APRItem?.Description))
            return item.APRItem.Description;

        if (!string.IsNullOrWhiteSpace(item.APRItem?.PPMPItem?.Description))
            return item.APRItem.PPMPItem.Description;

        return string.Empty;
    }

    public static string ResolveCategory(this PRItem item)
    {
        return item.PPMPItem?.NonCSEItem?.ItemCategory?.Name
            ?? item.PPMPItem?.CSEItem?.ItemCategory?.Name
            ?? item.APRItem?.PPMPItem?.CSEItem?.ItemCategory?.Name
            ?? item.APRItem?.PPMPItem?.NonCSEItem?.ItemCategory?.Name
            ?? item.APRItem?.PPMPItem?.PPMPExpenditureItem?.PPMPActivity?.LIBActivity?.Name
            ?? (item.PPMPItem != null ? item.PPMPItem.ProjectType.ToString() : null)
            ?? (item.APRItemId.HasValue ? "Out-of-Stock CSE" : string.Empty);
    }

    public static string ResolveUnit(this PRItem item)
    {
        return item.APRItem?.Unit
            ?? item.PPMPItem?.Unit
            ?? item.PPMPItem?.NonCSEItem?.UOM?.Name
            ?? item.PPMPItem?.CSEItem?.UOM?.Name
            ?? item.APRItem?.PPMPItem?.Unit
            ?? item.APRItem?.PPMPItem?.CSEItem?.UOM?.Name
            ?? "unit";
    }

    public static string? ResolveStockNo(this PRItem item)
    {
        return item.StockNo ?? item.APRItem?.ItemCode;
    }

    public static string ResolveOfficeName(this PRItem item, PurchaseRequest? pr = null)
    {
        return item.PPMPItem?.PPMPExpenditureItem?.PPMP?.Office?.Name
            ?? item.PPMPItem?.PPMPExpenditureItem?.PPMPActivity?.PPMP?.Office?.Name
            ?? item.APRItem?.APR?.Office?.Name
            ?? item.APRItem?.PPMPItem?.PPMPExpenditureItem?.PPMP?.Office?.Name
            ?? pr?.Office?.Name
            ?? string.Empty;
    }

    public static string ResolveAPROfficeName(this PRItem item, PurchaseRequest? pr = null)
    {
        return item.APRItem?.APR?.Office?.Name
            ?? item.APRItem?.PPMPItem?.PPMPExpenditureItem?.PPMP?.Office?.Name
            ?? pr?.Office?.Name
            ?? string.Empty;
    }

    public static string ResolveFund(this PRItem item, PurchaseRequest? pr = null)
    {
        return item.PPMPItem?.PPMPExpenditureItem?.PPMP?.FundSource?.Name
            ?? item.PPMPItem?.PPMPExpenditureItem?.PPMPActivity?.PPMP?.FundSource?.Name
            ?? item.APRItem?.PPMPItem?.PPMPExpenditureItem?.PPMPActivity?.PPMP?.FundSource?.Name
            ?? item.APRItem?.PPMPItem?.PPMPExpenditureItem?.PPMP?.FundSource?.Name
            ?? pr?.FundSource?.Name
            ?? string.Empty;
    }

    public static Guid? ResolvePPMPId(this PRItem item)
    {
        return item.PPMPItem?.PPMPExpenditureItem?.PPMPId
            ?? item.PPMPItem?.PPMPExpenditureItem?.PPMPActivity?.PPMPId
            ?? item.APRItem?.PPMPItem?.PPMPExpenditureItem?.PPMPId
            ?? item.APRItem?.PPMPItem?.PPMPExpenditureItem?.PPMPActivity?.PPMPId;
    }

    public static string? ResolvePPMPNumber(this PRItem item)
    {
        return item.PPMPItem?.PPMPExpenditureItem?.PPMP?.PPMPNumber
            ?? item.PPMPItem?.PPMPExpenditureItem?.PPMPActivity?.PPMP?.PPMPNumber
            ?? item.APRItem?.PPMPItem?.PPMPExpenditureItem?.PPMP?.PPMPNumber
            ?? item.APRItem?.PPMPItem?.PPMPExpenditureItem?.PPMPActivity?.PPMP?.PPMPNumber;
    }

    public static Guid? ResolveProcurementModeId(this PRItem item, ConsolidatedPRItem? ci = null)
    {
        if (ci?.ProcurementModeId.HasValue == true)
            return ci.ProcurementModeId;

        var consolidatedItemModeId = item.ConsolidatedPRItems?
            .OrderByDescending(c => c.CreatedAt)
            .FirstOrDefault(c => !c.IsDeleted && c.ProcurementModeId.HasValue)?.ProcurementModeId;
        if (consolidatedItemModeId.HasValue)
            return consolidatedItemModeId;

        var ppmpAppItemModeId = item.PPMPItem?.APPItems?
            .Where(ai => !ai.IsDeleted && (ai.APP == null || !ai.APP.IsDeleted))
            .OrderByDescending(ai => ai.APP != null && (ai.APP.Status == StatusEnum.Approved || ai.APP.Status == StatusEnum.Active) ? 2 : 1)
            .ThenByDescending(ai => ai.CreatedAt)
            .FirstOrDefault()?.ProcurementModeId;
        if (ppmpAppItemModeId.HasValue)
            return ppmpAppItemModeId;

        if (item.PPMPItem?.ProcurementModeId is Guid pmId && pmId != Guid.Empty)
            return pmId;

        if (item.APRItem?.APPItem?.ProcurementModeId is Guid aprAppPmId && aprAppPmId != Guid.Empty)
            return aprAppPmId;

        var aprPpmpAppItemModeId = item.APRItem?.PPMPItem?.APPItems?
            .Where(ai => !ai.IsDeleted && (ai.APP == null || !ai.APP.IsDeleted))
            .OrderByDescending(ai => ai.APP != null && (ai.APP.Status == StatusEnum.Approved || ai.APP.Status == StatusEnum.Active) ? 2 : 1)
            .ThenByDescending(ai => ai.CreatedAt)
            .FirstOrDefault()?.ProcurementModeId;
        if (aprPpmpAppItemModeId.HasValue)
            return aprPpmpAppItemModeId;

        if (item.APRItem?.PPMPItem?.ProcurementModeId is Guid aprPmId && aprPmId != Guid.Empty)
            return aprPmId;

        return null;
    }

    public static string? ResolveProcurementModeName(this PRItem item, ConsolidatedPRItem? ci = null)
    {
        if (!string.IsNullOrWhiteSpace(ci?.ProcurementMode?.Name))
            return ci.ProcurementMode.Name;

        var consolidatedItemModeName = item.ConsolidatedPRItems?
            .OrderByDescending(c => c.CreatedAt)
            .FirstOrDefault(c => !c.IsDeleted && c.ProcurementMode != null)?.ProcurementMode?.Name;
        if (!string.IsNullOrWhiteSpace(consolidatedItemModeName))
            return consolidatedItemModeName;

        var ppmpAppItemModeName = item.PPMPItem?.APPItems?
            .Where(ai => !ai.IsDeleted && (ai.APP == null || !ai.APP.IsDeleted))
            .OrderByDescending(ai => ai.APP != null && (ai.APP.Status == StatusEnum.Approved || ai.APP.Status == StatusEnum.Active) ? 2 : 1)
            .ThenByDescending(ai => ai.CreatedAt)
            .FirstOrDefault()?.ProcurementMode?.Name;
        if (!string.IsNullOrWhiteSpace(ppmpAppItemModeName))
            return ppmpAppItemModeName;

        if (!string.IsNullOrWhiteSpace(item.PPMPItem?.ProcurementMode?.Name))
            return item.PPMPItem.ProcurementMode.Name;

        if (!string.IsNullOrWhiteSpace(item.APRItem?.APPItem?.ProcurementMode?.Name))
            return item.APRItem.APPItem.ProcurementMode.Name;

        var aprPpmpAppItemModeName = item.APRItem?.PPMPItem?.APPItems?
            .Where(ai => !ai.IsDeleted && (ai.APP == null || !ai.APP.IsDeleted))
            .OrderByDescending(ai => ai.APP != null && (ai.APP.Status == StatusEnum.Approved || ai.APP.Status == StatusEnum.Active) ? 2 : 1)
            .ThenByDescending(ai => ai.CreatedAt)
            .FirstOrDefault()?.ProcurementMode?.Name;
        if (!string.IsNullOrWhiteSpace(aprPpmpAppItemModeName))
            return aprPpmpAppItemModeName;

        if (!string.IsNullOrWhiteSpace(item.APRItem?.PPMPItem?.ProcurementMode?.Name))
            return item.APRItem.PPMPItem.ProcurementMode.Name;

        return null;
    }
}

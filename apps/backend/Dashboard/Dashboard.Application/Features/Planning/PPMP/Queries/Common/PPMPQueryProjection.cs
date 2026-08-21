using ERPEZ.Application.Features.Planning.NonCSEItem.Dtos;
using ERPEZ.Application.Features.Planning.PPMP.Dtos;
using ERPEZ.Application.Features.Planning.PPMPItem.Dtos;
using ERPEZ.Application.Features.Planning.PPMPItemAllocation.Dtos;
using PPMPActivityEntity = ERPEZ.Domain.Entities.Planning.PPMPActivity;
using PPMPAllocationEntity = ERPEZ.Domain.Entities.Planning.PPMPItemAllocation;
using PPMPEntity = ERPEZ.Domain.Entities.Planning.PPMP;
using PPMPExpenditureItemEntity = ERPEZ.Domain.Entities.Planning.PPMPExpenditureItem;
using PPMPItemEntity = ERPEZ.Domain.Entities.Planning.PPMPItem;

namespace ERPEZ.Application.Features.Planning.PPMP.Queries.Common;

internal static class PPMPQueryProjection
{
    private static decimal GetItemEffectiveCost(PPMPItemEntity item)
    {
        var activeAllocations = item.PPMPItemAllocations.Where(a => !a.IsDeleted).ToList();
        if (activeAllocations.Count != 0)
        {
            return activeAllocations.Sum(a => a.Amount);
        }

        if (item.PlannedQuantity > 0)
        {
            decimal unitPrice = item.UnitPrice > 0
                ? item.UnitPrice
                : (item.CSEItem?.ItemPrices?.OrderByDescending(p => p.FiscalYear?.Year ?? 0).FirstOrDefault()?.UnitPrice
                   ?? item.NonCSEItem?.CurrentPrice
                   ?? 0m);

            return item.PlannedQuantity * unitPrice;
        }

        return 0m;
    }

    internal static PPMPDetailedResponse BuildDetailedResponse(PPMPEntity ppmp)
    {
        var items = GetPPMPItems(ppmp);
        var allocations = items.SelectMany(item => item.PPMPItemAllocations.Where(alloc => !alloc.IsDeleted)).ToList();

        return new PPMPDetailedResponse
        {
            Id = ppmp.Id,
            PPMPNumber = ppmp.PPMPNumber,
            OfficeId = ppmp.OfficeId,
            OfficeName = ppmp.Office?.Name ?? string.Empty,
            FiscalYearId = ppmp.FiscalYearId,
            FiscalYearName = ppmp.FiscalYear?.Year.ToString() ?? string.Empty,
            FundSourceId = ppmp.FundSourceId,
            FundSourceName = ppmp.FundSource?.Name,
            LIBId = ppmp.LIBId,
            LIBName = ppmp.LineItemBudget?.LIBNumber,
            ParentId = ppmp.ParentId,
            IsMaster = ppmp.IsMaster,
            Description = ppmp.Description,
            Version = ppmp.Version,
            TotalEstimatedBudget = items.Sum(GetItemEffectiveCost),
            Status = ppmp.Status.ToString(),
            SubmittedDate = ppmp.SubmittedDate,
            ApprovedDate = ppmp.ApprovedDate,
            ConsolidatedIntoId = ppmp.ConsolidatedIntoId,
            CreatedAt = ppmp.CreatedAt,
            CreatedBy = ppmp.CreatedBy,
            UpdatedAt = ppmp.UpdatedAt,
            UpdatedBy = ppmp.UpdatedBy,
            ParentPPMP = ppmp.ParentPPMP == null ? null : BuildSummaryResponse(ppmp.ParentPPMP, true),
            PPMPItems = items.Select(BuildItemResponse).ToList(),
            PPMPItemAllocations = allocations.Select(BuildAllocationResponse).ToList(),
            PPMPActivities = ppmp.PPMPActivities.Where(x => !x.IsDeleted).Select(BuildActivityResponse).ToList(),
            ApprovalEvents = ppmp.ApprovalEvents.Where(x => !x.IsDeleted).OrderByDescending(x => x.Timestamp).Select(x => new ApprovalEventResponse
            {
                Id = x.Id,
                PPMPId = x.PPMPId,
                Role = x.Role,
                Action = x.Action,
                ActorId = x.ActorId,
                ActorName = x.ActorName,
                Notes = x.Notes,
                Timestamp = x.Timestamp
            }).ToList(),
            ChildPPMPs = ppmp.ChildPPMPs.Where(x => !x.IsDeleted).Select(x => BuildSummaryResponse(x, false)).ToList()
        };
    }
    internal static PPMPItemResponse BuildItemResponse(PPMPItemEntity item)
    {
        var allocations = item.PPMPItemAllocations.Where(x => !x.IsDeleted).ToList();
        var ppmp = item.PPMPExpenditureItem?.PPMPActivity?.PPMP
                ?? item.PPMPExpenditureItem?.PPMP;

        // ✅ CSE Items: Get price based on the most recent Fiscal Year
        decimal? csePrice = item.CSEItem?.ItemPrices?
            .OrderByDescending(p => p.FiscalYear?.Year ?? 0)
            .FirstOrDefault()?.UnitPrice;

        // ✅ Non-CSE Items: Fetch price directly from CurrentPrice property
        decimal? nonCsePrice = item.NonCSEItem?.CurrentPrice;

        return new PPMPItemResponse
        {
            Id = item.Id,
            PPMPExpenditureItemId = item.PPMPExpenditureItemId,
            CSEItemId = item.CSEItemId,
            NonCSEItemId = item.NonCSEItemId,
            ProcurementModeId = item.ProcurementModeId,
            PAPCode = item.PAPCode,
            Name = item.Name,
            Description = item.Description,
            Unit = item.Unit,
            // Uses CSE FY price, or Non-CSE current price, or fallback calculation
            UnitPrice = item.UnitPrice > 0 
                ? item.UnitPrice 
                : (csePrice ?? nonCsePrice ?? (allocations.Any() && allocations.First().Quantity > 0 ? allocations.First().Amount / allocations.First().Quantity : 0)),
            PlannedQuantity = item.PlannedQuantity,
            MOPOverride = item.MOPOverride,
            // ── New fields ───────────────────────────────────────────────────────
            ProjectType              = item.ProjectType,
            PreProcurementConference = item.PreProcurementConference,
            ProcurementStartDate     = item.ProcurementStartDate,
            ProcurementEndDate       = item.ProcurementEndDate,
            ExpectedDeliveryStart    = item.ExpectedDeliveryStart,
            ExpectedDeliveryEnd      = item.ExpectedDeliveryEnd,
            Remarks                  = item.Remarks,
            MOPJustification = item.MOPJustification,
            CreatedAt = item.CreatedAt,
            CreatedBy = item.CreatedBy,
            PPMP = ppmp == null ? null : BuildSummaryResponse(ppmp, false),
            TotalAllocationAmount = allocations.Count != 0
                ? allocations.Sum(x => x.Amount)
                : (item.PlannedQuantity > 0 ? item.PlannedQuantity * (item.UnitPrice > 0 ? item.UnitPrice : (csePrice ?? nonCsePrice ?? 0m)) : 0m),
            PPMPItemAllocations = allocations.Select(BuildAllocationWithoutParents).ToList(),
            CSEItemName = item.CSEItem?.Name,
            NonCSEItemName = item.NonCSEItem?.Name,
            ProcurementModeName = item.ProcurementMode?.Name ?? string.Empty,
            NonCSEItem = item.NonCSEItem == null ? null : new NonCSEItemResponse
            {
                Id = item.NonCSEItem.Id,
                Name = item.NonCSEItem.Name,
                Description = item.NonCSEItem.Description,
                UOMId = item.NonCSEItem.UOMId,
                UOMName = item.NonCSEItem.UOM?.Name,
                ItemRequestId = item.NonCSEItem.ItemRequestId,
                ProductCode = item.NonCSEItem.ProductCode,
                CurrentPrice = item.NonCSEItem.CurrentPrice,
                Remarks = item.NonCSEItem.Remarks,
                CreatedAt = item.NonCSEItem.CreatedAt,
                CreatedBy = item.NonCSEItem.CreatedBy
            }
        };
    }

    internal static PPMPItemAllocationResponse BuildAllocationResponse(PPMPAllocationEntity allocation)
    {
        var ppmp = allocation.PPMPItem?.PPMPExpenditureItem?.PPMPActivity?.PPMP
                ?? allocation.PPMPItem?.PPMPExpenditureItem?.PPMP; // ← fallback to direct PPMP

        return new PPMPItemAllocationResponse
        {
            Id = allocation.Id,
            PPMPItemId = allocation.PPMPItemId,
            AllocationMonth = allocation.AllocationMonth,
            Quantity = allocation.Quantity,
            Amount = allocation.Amount,
            CreatedAt = allocation.CreatedAt,
            CreatedBy = allocation.CreatedBy,
            PPMPItem = allocation.PPMPItem == null ? null : BuildItemWithoutAllocations(allocation.PPMPItem),
            PPMP = ppmp == null ? null : BuildSummaryResponse(ppmp, false)
        };
    }

    private static PPMPResponse BuildSummaryResponse(PPMPEntity ppmp, bool includeCollections)
    {
        var items = includeCollections ? GetPPMPItems(ppmp) : [];
        var allocations = includeCollections ? items.SelectMany(item => item.PPMPItemAllocations.Where(alloc => !alloc.IsDeleted)).ToList() : [];

        return new PPMPResponse
        {
            Id = ppmp.Id,
            PPMPNumber = ppmp.PPMPNumber,
            OfficeId = ppmp.OfficeId,
            OfficeName = ppmp.Office?.Name ?? string.Empty,
            FiscalYearId = ppmp.FiscalYearId,
            FiscalYearName = ppmp.FiscalYear?.Year.ToString() ?? string.Empty,
            FundSourceId = ppmp.FundSourceId,
            FundSourceName = ppmp.FundSource?.Name,
            LIBId = ppmp.LIBId,
            LIBName = ppmp.LineItemBudget?.LIBNumber,
            ParentId = ppmp.ParentId,
            IsMaster = ppmp.IsMaster,
            Description = ppmp.Description,
            Version = ppmp.Version,
            TotalEstimatedBudget = includeCollections ? items.Sum(GetItemEffectiveCost) : ppmp.TotalEstimatedBudget,
            Status = ppmp.Status.ToString(),
            SubmittedDate = ppmp.SubmittedDate,
            ApprovedDate = ppmp.ApprovedDate,
            ConsolidatedIntoId = ppmp.ConsolidatedIntoId,
            CreatedAt = ppmp.CreatedAt,
            CreatedBy = ppmp.CreatedBy,
            UpdatedAt = ppmp.UpdatedAt,
            UpdatedBy = ppmp.UpdatedBy,
            PPMPItems = includeCollections ? items.Select(BuildItemResponse).ToList() : [],
            PPMPItemAllocations = includeCollections ? allocations.Select(BuildAllocationResponse).ToList() : [],
            PPMPActivities = includeCollections ? ppmp.PPMPActivities.Where(x => !x.IsDeleted).Select(BuildActivityResponse).ToList() : [],
            ApprovalEvents = includeCollections ? ppmp.ApprovalEvents.Where(x => !x.IsDeleted).OrderByDescending(x => x.Timestamp).Select(x => new ApprovalEventResponse
            {
                Id = x.Id,
                PPMPId = x.PPMPId,
                Role = x.Role,
                Action = x.Action,
                ActorId = x.ActorId,
                ActorName = x.ActorName,
                Notes = x.Notes,
                Timestamp = x.Timestamp
            }).ToList() : [],
            ChildPPMPs = []
        };
    }

    private static PPMPActivityResponse BuildActivityResponse(PPMPActivityEntity activity)
    {
        var items = activity.PPMPExpenditureItems
            .Where(expenditureItem => !expenditureItem.IsDeleted)
            .SelectMany(expenditureItem => expenditureItem.PPMPItems.Where(item => !item.IsDeleted))
            .ToList();
        var allocations = items
            .SelectMany(item => item.PPMPItemAllocations.Where(allocation => !allocation.IsDeleted))
            .ToList();

        return new PPMPActivityResponse
        {
            Id = activity.Id,
            PPMPId = activity.PPMPId,
            LIBActivityId = activity.LIBActivityId,
            ActivityName = activity.LIBActivity?.Name ?? string.Empty,
            ActivityCode = string.Empty,
            TotalItems = items.Count,
            TotalItemAllocations = allocations.Count,
            TotalAllocationQuantity = items.Sum(i => {
                var aQty = i.PPMPItemAllocations.Where(a => !a.IsDeleted).Sum(a => a.Quantity);
                return aQty > 0 ? aQty : i.PlannedQuantity;
            }),
            TotalAllocationAmount = items.Sum(GetItemEffectiveCost),
            CreatedAt = activity.CreatedAt,
            PPMPExpenditureItems = activity.PPMPExpenditureItems.Where(x => !x.IsDeleted).Select(BuildExpenditureItemResponse).ToList()
        };
    }

    private static PPMPExpenditureItemResponse BuildExpenditureItemResponse(PPMPExpenditureItemEntity expenditureItem)
    {
        var expItems = expenditureItem.PPMPItems.Where(x => !x.IsDeleted).ToList();
        var expCost = expItems.Count > 0 ? expItems.Sum(GetItemEffectiveCost) : expenditureItem.TotalCost;

        return new PPMPExpenditureItemResponse
        {
            Id = expenditureItem.Id,
            PPMPActivityId = expenditureItem.PPMPActivityId,
            IsProcurable = expenditureItem.IsProcurable,
            TotalCost = expCost,
            CreatedAt = expenditureItem.CreatedAt,
            CreatedBy = expenditureItem.CreatedBy,
            PPMPItems = expItems.Select(BuildItemResponse).ToList()
        };
    }

    private static PPMPItemAllocationResponse BuildAllocationWithoutParents(PPMPAllocationEntity allocation)
    {
        return new PPMPItemAllocationResponse
        {
            Id = allocation.Id,
            PPMPItemId = allocation.PPMPItemId,
            AllocationMonth = allocation.AllocationMonth,
            Quantity = allocation.Quantity,
            Amount = allocation.Amount,
            CreatedAt = allocation.CreatedAt,
            CreatedBy = allocation.CreatedBy
        };
    }

    private static PPMPItemResponse BuildItemWithoutAllocations(PPMPItemEntity item)
    {
        // ✅ CSE Items: Get price based on the most recent Fiscal Year
        decimal? csePrice = item.CSEItem?.ItemPrices?
            .OrderByDescending(p => p.FiscalYear?.Year ?? 0)
            .FirstOrDefault()?.UnitPrice;

        // ✅ Non-CSE Items: Fetch price directly from CurrentPrice property
        decimal? nonCsePrice = item.NonCSEItem?.CurrentPrice;

        return new PPMPItemResponse
        {
            Id = item.Id,
            PPMPExpenditureItemId = item.PPMPExpenditureItemId,
            CSEItemId = item.CSEItemId,
            NonCSEItemId = item.NonCSEItemId,
            ProcurementModeId = item.ProcurementModeId,
            PAPCode = item.PAPCode,
            Name = item.Name,
            Description = item.Description,
            Unit = item.Unit,
            UnitPrice = item.UnitPrice > 0 
                ? item.UnitPrice 
                : (csePrice ?? nonCsePrice ?? 0),
            MOPOverride = item.MOPOverride,
            MOPJustification = item.MOPJustification,
            // ── New fields ───────────────────────────────────────────────────────
            ProjectType               = item.ProjectType,
            PreProcurementConference  = item.PreProcurementConference,
            ProcurementStartDate      = item.ProcurementStartDate,
            ProcurementEndDate        = item.ProcurementEndDate,
            ExpectedDeliveryStart     = item.ExpectedDeliveryStart,
            ExpectedDeliveryEnd       = item.ExpectedDeliveryEnd,
            Remarks                   = item.Remarks,
            CreatedAt = item.CreatedAt,
            CreatedBy = item.CreatedBy,
            CSEItemName = item.CSEItem?.Name,
            NonCSEItemName = item.NonCSEItem?.Name,
            ProcurementModeName = item.ProcurementMode?.Name ?? string.Empty,
            TotalAllocationAmount = item.PPMPItemAllocations.Where(x => !x.IsDeleted).Sum(x => x.Amount)
        };
    }

    private static List<PPMPItemEntity> GetPPMPItems(PPMPEntity ppmp)
    {
        // Activity-based items
        var activityItems = ppmp.PPMPActivities
            .Where(activity => !activity.IsDeleted)
            .SelectMany(activity => activity.PPMPExpenditureItems.Where(ei => !ei.IsDeleted))
            .SelectMany(ei => ei.PPMPItems.Where(item => !item.IsDeleted))
            .ToList();

        // Project-level items (no activity)
        var projectItems = ppmp.PPMPExpenditureItems?
            .Where(ei => !ei.IsDeleted && ei.PPMPActivityId == null)
            .SelectMany(ei => ei.PPMPItems.Where(item => !item.IsDeleted))
            .ToList() ?? [];

        return activityItems.Concat(projectItems).ToList();
    }
}

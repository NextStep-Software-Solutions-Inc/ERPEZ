using ERPEZ.Application.Features.Planning.NonCSEItem.Dtos;
using ERPEZ.Application.Features.Planning.PPMPItem.Dtos;
using ERPEZ.Application.Features.Planning.PPMPItemAllocation.Dtos;
using PPMPActivityEntity = ERPEZ.Domain.Entities.Planning.PPMPActivity;
using PPMPAllocationEntity = ERPEZ.Domain.Entities.Planning.PPMPItemAllocation;
using PPMPEntity = ERPEZ.Domain.Entities.Planning.PPMP;
using PPMPExpenditureItemEntity = ERPEZ.Domain.Entities.Planning.PPMPExpenditureItem;
using PPMPItemEntity = ERPEZ.Domain.Entities.Planning.PPMPItem;

namespace ERPEZ.Application.Features.Planning.PPMP.Dtos;

public static class PPMPResponseMapper
{
    public static PPMPDetailedResponse MapDetailed(PPMPEntity ppmp)
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
            Version = ppmp.Version,
            TotalEstimatedBudget = allocations.Sum(a => a.Amount),
            Status = ppmp.Status.ToString(),
            SubmittedDate = ppmp.SubmittedDate,
            ApprovedDate = ppmp.ApprovedDate,
            ConsolidatedIntoId = ppmp.ConsolidatedIntoId,
            CreatedAt = ppmp.CreatedAt,
            CreatedBy = ppmp.CreatedBy,
            UpdatedAt = ppmp.UpdatedAt,
            UpdatedBy = ppmp.UpdatedBy,
            ParentPPMP = ppmp.ParentPPMP == null ? null : MapSummary(ppmp.ParentPPMP, true),
            PPMPItems = items.Select(MapItem).ToList(),
            PPMPItemAllocations = allocations.Select(MapAllocation).ToList(),
            PPMPActivities = ppmp.PPMPActivities.Where(x => !x.IsDeleted).Select(MapActivity).ToList(),
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
            ChildPPMPs = ppmp.ChildPPMPs.Where(x => !x.IsDeleted).Select(x => MapSummary(x, false)).ToList()
        };
    }

    public static PPMPResponse MapSummary(PPMPEntity ppmp, bool includeCollections)
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
            Version = ppmp.Version,
            TotalEstimatedBudget = includeCollections ? allocations.Sum(a => a.Amount) : ppmp.TotalEstimatedBudget,
            Status = ppmp.Status.ToString(),
            SubmittedDate = ppmp.SubmittedDate,
            ApprovedDate = ppmp.ApprovedDate,
            ConsolidatedIntoId = ppmp.ConsolidatedIntoId,
            CreatedAt = ppmp.CreatedAt,
            CreatedBy = ppmp.CreatedBy,
            UpdatedAt = ppmp.UpdatedAt,
            UpdatedBy = ppmp.UpdatedBy,
            PPMPItems = includeCollections ? items.Select(MapItem).ToList() : [],
            PPMPItemAllocations = includeCollections ? allocations.Select(MapAllocation).ToList() : [],
            PPMPActivities = includeCollections ? ppmp.PPMPActivities.Where(x => !x.IsDeleted).Select(MapActivity).ToList() : [],
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

    public static PPMPActivityResponse MapActivity(PPMPActivityEntity activity)
    {
        return new PPMPActivityResponse
        {
            Id = activity.Id,
            PPMPId = activity.PPMPId,
            LIBActivityId = activity.LIBActivityId,
            ActivityName = activity.LIBActivity?.Name ?? string.Empty,
            ActivityCode = string.Empty,
            CreatedAt = activity.CreatedAt,
            PPMPExpenditureItems = activity.PPMPExpenditureItems.Where(x => !x.IsDeleted).Select(MapExpenditureItem).ToList()
        };
    }

    public static PPMPExpenditureItemResponse MapExpenditureItem(PPMPExpenditureItemEntity expenditureItem)
    {
        return new PPMPExpenditureItemResponse
        {
            Id = expenditureItem.Id,
            PPMPActivityId = expenditureItem.PPMPActivityId,
            IsProcurable = expenditureItem.IsProcurable,
            TotalCost = expenditureItem.TotalCost,
            CreatedAt = expenditureItem.CreatedAt,
            CreatedBy = expenditureItem.CreatedBy,
            PPMPItems = expenditureItem.PPMPItems.Where(x => !x.IsDeleted).Select(MapItem).ToList()
        };
    }

    public static PPMPItemResponse MapItem(PPMPItemEntity item)
    {
        var allocations = item.PPMPItemAllocations.Where(x => !x.IsDeleted).ToList();
        var ppmp = item.PPMPExpenditureItem?.PPMPActivity?.PPMP;

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
            UnitPrice = item.UnitPrice,
            MOPOverride = item.MOPOverride,
            MOPJustification = item.MOPJustification,
            CreatedAt = item.CreatedAt,
            CreatedBy = item.CreatedBy,
            PPMP = ppmp == null ? null : MapSummary(ppmp, false),
            TotalAllocationAmount = allocations.Sum(x => x.Amount),
            PPMPItemAllocations = allocations.Select(MapAllocationWithoutParents).ToList(),
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
                IsActive = item.NonCSEItem.IsActive,
                CreatedAt = item.NonCSEItem.CreatedAt,
                CreatedBy = item.NonCSEItem.CreatedBy
            }
        };
    }

    public static PPMPItemAllocationResponse MapAllocation(PPMPAllocationEntity allocation)
    {
        return new PPMPItemAllocationResponse
        {
            Id = allocation.Id,
            PPMPItemId = allocation.PPMPItemId,
            AllocationMonth = allocation.AllocationMonth,
            Quantity = allocation.Quantity,
            Amount = allocation.Amount,
            CreatedAt = allocation.CreatedAt,
            CreatedBy = allocation.CreatedBy,
            PPMPItem = MapItemWithoutAllocations(allocation.PPMPItem),
            PPMP = allocation.PPMPItem?.PPMPExpenditureItem?.PPMPActivity?.PPMP == null
                ? null
                : MapSummary(allocation.PPMPItem.PPMPExpenditureItem.PPMPActivity.PPMP, false)
        };
    }

    private static PPMPItemAllocationResponse MapAllocationWithoutParents(PPMPAllocationEntity allocation)
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

    private static PPMPItemResponse MapItemWithoutAllocations(PPMPItemEntity item)
    {
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
            UnitPrice = item.UnitPrice,
            MOPOverride = item.MOPOverride,
            MOPJustification = item.MOPJustification,
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
        return ppmp.PPMPActivities
            .Where(activity => !activity.IsDeleted)
            .SelectMany(activity => activity.PPMPExpenditureItems.Where(expenditureItem => !expenditureItem.IsDeleted))
            .SelectMany(expenditureItem => expenditureItem.PPMPItems.Where(item => !item.IsDeleted))
            .ToList();
    }
}
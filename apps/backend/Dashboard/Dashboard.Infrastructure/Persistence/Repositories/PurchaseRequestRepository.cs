using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Sieve.Models;
using Sieve.Services;
using System.Linq.Expressions;
using ERPEZ.Domain.Models;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class PurchaseRequestRepository : Repository<PurchaseRequest>, IPurchaseRequestRepository
{
    private readonly ApplicationDbContext context;
    private readonly ISieveProcessor sieveProcessor;

    public PurchaseRequestRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
        this.context = context;
        this.sieveProcessor = sieveProcessor;
    }

    private IQueryable<PurchaseRequest> BuildDetailedQuery(IQueryable<PurchaseRequest>? source = null)
    {
        var q = source ?? context.Set<PurchaseRequest>();

        return q
            .Include(pr => pr.Office)
            .Include(pr => pr.FundSource)
            .Include(pr => pr.UACSCodeCombination)
            .Include(pr => pr.ProcurementCategory)
            .Include(pr => pr.PRItems.Where(i => !i.IsDeleted))
                .ThenInclude(i => i.PPMPItem)
                    .ThenInclude(pi => pi!.NonCSEItem)
                        .ThenInclude(n => n!.UOM)
            .Include(pr => pr.PRItems.Where(i => !i.IsDeleted))
                .ThenInclude(i => i.PPMPItem)
                    .ThenInclude(pi => pi!.NonCSEItem)
                        .ThenInclude(n => n!.ItemCategory)
            .Include(pr => pr.PRItems.Where(i => !i.IsDeleted))
                .ThenInclude(i => i.PPMPItem)
                    .ThenInclude(pi => pi!.CSEItem)
                        .ThenInclude(c => c!.ItemCategory)
            .Include(pr => pr.PRItems.Where(i => !i.IsDeleted))
                .ThenInclude(i => i.PPMPItem)
                    .ThenInclude(pi => pi!.NonCSEItem)
                        .ThenInclude(n => n!.ItemRequest)
            .Include(pr => pr.PRItems.Where(i => !i.IsDeleted))
                .ThenInclude(i => i.PPMPItem)
                    .ThenInclude(pi => pi!.CSEItem)
                        .ThenInclude(c => c!.UOM)
            .Include(pr => pr.PRItems.Where(i => !i.IsDeleted))
                .ThenInclude(i => i.PPMPItem)
                    .ThenInclude(pi => pi!.PPMPExpenditureItem)
                        .ThenInclude(e => e!.PPMP)
                            .ThenInclude(p => p!.Office)
            .Include(pr => pr.PRItems.Where(i => !i.IsDeleted))
                .ThenInclude(i => i.PPMPItem)
                    .ThenInclude(pi => pi!.PPMPExpenditureItem)
                        .ThenInclude(e => e!.PPMP)
                            .ThenInclude(p => p!.FundSource)
            .Include(pr => pr.PRItems.Where(i => !i.IsDeleted))
                .ThenInclude(i => i.PPMPItem)
                    .ThenInclude(pi => pi!.PPMPExpenditureItem)
                        .ThenInclude(e => e!.PPMPActivity)
                            .ThenInclude(a => a!.LIBActivity)
            .Include(pr => pr.PRItems.Where(i => !i.IsDeleted))
                .ThenInclude(i => i.PPMPItem)
                    .ThenInclude(pi => pi!.PPMPExpenditureItem)
                        .ThenInclude(e => e!.PPMPActivity)
                            .ThenInclude(a => a!.PPMP)
                                .ThenInclude(p => p!.Office)
            .Include(pr => pr.PRItems.Where(i => !i.IsDeleted))
                .ThenInclude(i => i.PPMPItem)
                    .ThenInclude(pi => pi!.PPMPExpenditureItem)
                        .ThenInclude(e => e!.PPMPActivity)
                            .ThenInclude(a => a!.PPMP)
                                .ThenInclude(p => p!.FundSource)
            .Include(pr => pr.PRItems.Where(i => !i.IsDeleted))
                .ThenInclude(i => i.PPMPItem)
                    .ThenInclude(pi => pi!.ProcurementMode)
            .Include(pr => pr.PRItems.Where(i => !i.IsDeleted))
                .ThenInclude(i => i.PPMPItem)
                    .ThenInclude(pi => pi!.APPItems)
                        .ThenInclude(ai => ai.ProcurementMode)
            .Include(pr => pr.PRItems.Where(i => !i.IsDeleted))
                .ThenInclude(i => i.PPMPItem)
                    .ThenInclude(pi => pi!.APPItems)
                        .ThenInclude(ai => ai.APP)
            .Include(pr => pr.PRItems.Where(i => !i.IsDeleted))
                .ThenInclude(i => i.ConsolidatedPRItems.Where(ci => !ci.IsDeleted))
                    .ThenInclude(ci => ci.ProcurementMode)
            .Include(pr => pr.ApprovalEvents.OrderByDescending(ae => ae.Timestamp))
            .AsSplitQuery();
    }

    public async Task<PurchaseRequest?> GetPRWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await BuildDetailedQuery()
            .Where(pr => pr.Id == id && !pr.IsDeleted)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<(IReadOnlyList<PurchaseRequest> Entities, int TotalCount)> GetDetailedPagedAsync(SieveModel sieveModel, CancellationToken cancellationToken = default)
    {
        var query         = BuildDetailedQuery(context.Set<PurchaseRequest>().AsNoTracking().Where(pr => !pr.IsDeleted));
        var filteredQuery = sieveProcessor.Apply(sieveModel, query, applyPagination: false);
        var totalCount    = await filteredQuery.CountAsync(cancellationToken);
        var pagedQuery    = sieveProcessor.Apply(sieveModel, filteredQuery, applyFiltering: false, applySorting: false);
        var entities      = await pagedQuery.ToListAsync(cancellationToken);
        return (entities, totalCount);
    }

    public async Task<List<PurchaseRequest>> GetByOfficeAsync(Guid officeId, PRType? prType = null, CancellationToken cancellationToken = default)
    {
        var baseQuery = context.Set<PurchaseRequest>().Where(pr => !pr.IsDeleted && pr.OfficeId == officeId);

        if (prType.HasValue)
            baseQuery = baseQuery.Where(pr => pr.PRType == prType.Value);

        return await BuildDetailedQuery(baseQuery).ToListAsync(cancellationToken);
    }

    public async Task<List<EligiblePPMPItemResult>> GetEligibleNonCSEItemsAsync(Guid officeId, Guid? currentPRId = null, CancellationToken cancellationToken = default)
    {
        var reservedQty = await context.Set<PRItem>()
            .Where(i =>
                i.PurchaseRequest.OfficeId == officeId &&
                !i.PurchaseRequest.IsDeleted &&
                i.PurchaseRequest.Status != StatusEnum.Returned &&
                i.PurchaseRequest.PRType == PRType.NonCSE &&
                (!currentPRId.HasValue || i.PurchaseRequestId != currentPRId.Value))
            .GroupBy(i => new { i.PPMPItemId, i.RequestedMonth })
            .Select(g => new { g.Key.PPMPItemId, g.Key.RequestedMonth, ReservedQty = g.Sum(i => i.RequestedQuantity) }) 
            .ToListAsync(cancellationToken);

        var ppmpItems = await context.Set<PPMPItem>()
            .Include(pi => pi.PPMPExpenditureItem)
                .ThenInclude(pei => pei.PPMP)
                    .ThenInclude(p => p.Office)
            .Include(pi => pi.PPMPExpenditureItem)
                .ThenInclude(pei => pei.PPMP)
                    .ThenInclude(p => p.FundSource)
            .Include(pi => pi.PPMPExpenditureItem)
                .ThenInclude(pei => pei.PPMPActivity)
                    .ThenInclude(pa => pa!.PPMP)
                        .ThenInclude(p => p.Office)
            .Include(pi => pi.PPMPExpenditureItem)
                .ThenInclude(pei => pei.PPMPActivity)
                    .ThenInclude(pa => pa!.PPMP)
                        .ThenInclude(p => p.FundSource)
            .Include(pi => pi.PPMPExpenditureItem)
                .ThenInclude(pei => pei.PPMPActivity)
                    .ThenInclude(pa => pa!.LIBActivity)
            .Include(pi => pi.PPMPExpenditureItem)
                .ThenInclude(pei => pei.Object)
            .Include(pi => pi.NonCSEItem)
                .ThenInclude(n => n!.UOM)
            .Include(pi => pi.NonCSEItem)
                .ThenInclude(n => n!.ItemRequest)
            .Include(pi => pi.PPMPItemAllocations)
            .Include(pi => pi.ProcurementMode)
            .Include(pi => pi.APPItems)
                .ThenInclude(ai => ai.ProcurementMode)
            .Include(pi => pi.APPItems)
                .ThenInclude(ai => ai.APP)
            .Where(pi =>
                !pi.IsDeleted &&
                pi.NonCSEItemId != null &&
                pi.NonCSEItem != null &&
                !pi.NonCSEItem.IsDeleted &&
                (
                    (pi.PPMPExpenditureItem != null && pi.PPMPExpenditureItem.PPMP != null &&
                     pi.PPMPExpenditureItem.PPMP.OfficeId == officeId &&
                     pi.PPMPExpenditureItem.PPMP.Status == StatusEnum.Approved &&
                     !pi.PPMPExpenditureItem.PPMP.IsDeleted)
                    ||
                    (pi.PPMPExpenditureItem != null && pi.PPMPExpenditureItem.PPMPActivity != null &&
                     pi.PPMPExpenditureItem.PPMPActivity.PPMP != null &&
                     pi.PPMPExpenditureItem.PPMPActivity.PPMP.OfficeId == officeId &&
                     pi.PPMPExpenditureItem.PPMPActivity.PPMP.Status == StatusEnum.Approved &&
                     !pi.PPMPExpenditureItem.PPMPActivity.PPMP.IsDeleted)
                ) &&
                pi.APPItems.Any(ai => !ai.IsDeleted && !ai.APP.IsDeleted && ai.APP.Status == StatusEnum.Approved))
            .AsSplitQuery()
            .ToListAsync(cancellationToken);

        return ppmpItems
            .SelectMany(pi =>
            {
                var ppmp = pi.PPMPExpenditureItem?.PPMP ?? pi.PPMPExpenditureItem?.PPMPActivity?.PPMP;
                if (ppmp == null) return Enumerable.Empty<EligiblePPMPItemResult>();

                var appItem = pi.APPItems?.FirstOrDefault(ai => !ai.IsDeleted && !ai.APP.IsDeleted && ai.APP.Status == StatusEnum.Approved);
                var effectiveModeId = appItem?.ProcurementModeId ?? (pi.ProcurementModeId != Guid.Empty ? pi.ProcurementModeId : (Guid?)null);
                var effectiveModeName = appItem?.ProcurementMode?.Name ?? pi.ProcurementMode?.Name;

                decimal effectiveUnitPrice = pi.UnitPrice;
                if (appItem?.EstimatedBudgetOverride.HasValue == true && appItem.EstimatedBudgetOverride.Value > 0 && pi.PlannedQuantity > 0)
                {
                    effectiveUnitPrice = Math.Round(appItem.EstimatedBudgetOverride.Value / pi.PlannedQuantity, 2);
                }

                var description = !string.IsNullOrWhiteSpace(pi.Description) 
                    ? pi.Description 
                    : (!string.IsNullOrWhiteSpace(pi.NonCSEItem?.Description) ? pi.NonCSEItem.Description : pi.Name);
                var category = !string.IsNullOrWhiteSpace(pi.NonCSEItem?.ItemRequest?.ItemCategory)
                    ? pi.NonCSEItem.ItemRequest.ItemCategory
                    : (!string.IsNullOrWhiteSpace(pi.PPMPExpenditureItem?.PPMPActivity?.LIBActivity?.Name)
                        ? pi.PPMPExpenditureItem.PPMPActivity.LIBActivity.Name
                        : "General");
                var itemCategory = pi.NonCSEItem?.ItemRequest?.ItemCategory;
                var uacsCode = !string.IsNullOrWhiteSpace(pi.NonCSEItem?.ItemRequest?.UACSCode)
                    ? pi.NonCSEItem.ItemRequest.UACSCode
                    : pi.PPMPExpenditureItem?.Object?.Code;

                var activeAllocations = pi.PPMPItemAllocations
                    .Where(a => !a.IsDeleted && a.Quantity > 0)
                    .ToList();

                if (activeAllocations.Count > 0)
                {
                    var results = new List<EligiblePPMPItemResult>();
                    foreach (var allocation in activeAllocations)
                    {
                        var allocMonth = allocation.AllocationMonth;
                        var reserved = reservedQty.FirstOrDefault(r => r.PPMPItemId == pi.Id && r.RequestedMonth == allocMonth)?.ReservedQty ?? 0;
                        var available = allocation.Quantity - reserved;

                        if (available > 0)
                        {
                            results.Add(new EligiblePPMPItemResult(
                                PPMPId:                 ppmp.Id,
                                PPMPNumber:             ppmp.PPMPNumber,
                                OfficeId:               ppmp.OfficeId,
                                OfficeName:             ppmp.Office?.Name ?? string.Empty,
                                PPMPItemId:             pi.Id,
                                ItemName:               pi.Name,
                                Description:            description,
                                Category:               category,
                                ItemCategory:           itemCategory,
                                UacsCode:               uacsCode,
                                Fund:                   ppmp.FundSource?.Name ?? string.Empty,
                                Unit:                   pi.Unit,
                                UnitPrice:              effectiveUnitPrice,
                                HasMonthlyAllocations:  true,
                                PlannedQuantity:        pi.PlannedQuantity,
                                TotalAvailableQuantity: available,
                                Month:                  allocMonth,
                                TotalAllocatedQuantity: allocation.Quantity,
                                AvailableQuantity:      available,
                                TotalAvailableAmount:   available * effectiveUnitPrice,
                                ProcurementModeId:      effectiveModeId,
                                ProcurementModeName:    effectiveModeName
                            ));
                        }
                    }
                    return results;
                }
                else
                {
                    // No monthly allocations defined — track against overall planned quantity
                    var totalReserved = reservedQty.Where(r => r.PPMPItemId == pi.Id).Sum(r => r.ReservedQty);
                    var available = pi.PlannedQuantity - totalReserved;

                    if (available <= 0) return Enumerable.Empty<EligiblePPMPItemResult>();

                    return new[]
                    {
                        new EligiblePPMPItemResult(
                            PPMPId:                 ppmp.Id,
                            PPMPNumber:             ppmp.PPMPNumber,
                            OfficeId:               ppmp.OfficeId,
                            OfficeName:             ppmp.Office?.Name ?? string.Empty,
                            PPMPItemId:             pi.Id,
                            ItemName:               pi.Name,
                            Description:            description,
                            Category:               category,
                            ItemCategory:           itemCategory,
                            UacsCode:               uacsCode,
                            Fund:                   ppmp.FundSource?.Name ?? string.Empty,
                            Unit:                   pi.Unit,
                            UnitPrice:              effectiveUnitPrice,
                            HasMonthlyAllocations:  false,
                            PlannedQuantity:        pi.PlannedQuantity,
                            TotalAvailableQuantity: available,
                            Month:                  null,
                            TotalAllocatedQuantity: pi.PlannedQuantity,
                            AvailableQuantity:      available,
                            TotalAvailableAmount:   available * effectiveUnitPrice,
                            ProcurementModeId:      effectiveModeId,
                            ProcurementModeName:    effectiveModeName
                        )
                    };
                }
            })
            .ToList();
    }

    public async Task<List<EligibleAPRItemResult>> GetEligibleOutOfStockItemsAsync(Guid officeId, CancellationToken cancellationToken = default)
    {
        var reservedQty = await context.Set<PRItem>()
            .Where(i =>
                i.APRItemId != null &&
                i.PurchaseRequest.OfficeId == officeId &&
                !i.PurchaseRequest.IsDeleted &&
                i.PurchaseRequest.Status != StatusEnum.Returned &&
                i.PurchaseRequest.PRType == PRType.OutOfStockCSE)
            .GroupBy(i => i.APRItemId!.Value)
            .Select(g => new { APRItemId = g.Key, ReservedQty = g.Sum(i => i.RequestedQuantity) })
            .ToDictionaryAsync(x => x.APRItemId, x => x.ReservedQty, cancellationToken);

        var aprItems = await context.Set<APRItem>()
            .Include(ai => ai.APR)
                .ThenInclude(a => a.Office)
            .Include(ai => ai.APR)
                .ThenInclude(a => a.FiscalYear)
            .Include(ai => ai.PPMPItem!)
                .ThenInclude(pi => pi.CSEItem)
                    .ThenInclude(c => c!.UOM)
            .Include(ai => ai.PPMPItem!)
                .ThenInclude(pi => pi.PPMPExpenditureItem)
                    .ThenInclude(pei => pei.PPMPActivity)
                        .ThenInclude(pa => pa!.LIBActivity)
            .Include(ai => ai.PPMPItem!)
                .ThenInclude(pi => pi.PPMPExpenditureItem)
                    .ThenInclude(pei => pei.PPMPActivity)
                        .ThenInclude(pa => pa!.PPMP)
                            .ThenInclude(p => p.FundSource)
            .Where(ai =>
                !ai.IsDeleted &&
                ai.APR.OfficeId == officeId &&
                ai.APR.Status == StatusEnum.Approved &&
                !ai.APR.IsDeleted)
            .AsSplitQuery()
            .ToListAsync(cancellationToken);

        return aprItems
            .Select(ai =>
            {
                var apr = ai.APR;
                var totalReq = (int)ai.QuantityRequested;
                var reserved = reservedQty.GetValueOrDefault(ai.Id, 0);
                var deficit = totalReq - reserved;

                if (deficit <= 0) return null;

                // For APR Items we don't have monthly allocations on the APR item itself,
                // but the FE requires MonthlyAllocations for UI consistency.
                var allocations = new Dictionary<AllocationMonthEnum, int>();

                return new EligibleAPRItemResult(
                    APRId:              apr.Id,
                    APRNumber:          apr.APRNumber,
                    OfficeId:           apr.OfficeId,
                    OfficeName:         apr.Office?.Name ?? string.Empty,
                    APRItemId:          ai.Id,
                    ItemName:           ai.Description ?? ai.PPMPItem?.Name ?? string.Empty,
                    Category:           ai.PPMPItem?.PPMPExpenditureItem?.PPMPActivity?.LIBActivity?.Name ?? string.Empty,
                    Fund:               ai.PPMPItem?.PPMPExpenditureItem?.PPMPActivity?.PPMP?.FundSource?.Name ?? string.Empty,
                    Unit:               ai.Unit ?? ai.PPMPItem?.Unit ?? string.Empty,
                    UnitPrice:          ai.UnitCost,
                    MonthlyAllocations: allocations,
                    TotalRequired:      totalReq,
                    CurrentFulfilled:   reserved,
                    Deficit:            deficit
                );
            })
            .Where(r => r is not null)
            .Cast<EligibleAPRItemResult>()
            .ToList();
    }

    public async Task<(IReadOnlyList<TDto> Entities, int TotalCount)> GetPRsWithDetailsAsync<TDto>(
        SieveModel sieveModel,
        Expression<Func<PurchaseRequest, TDto>> projection,
        List<Expression<Func<PurchaseRequest, object>>> includes,
        CancellationToken cancellationToken = default) where TDto : class
    {
        IQueryable<PurchaseRequest> query = context.Set<PurchaseRequest>().AsNoTracking().Where(e => !e.IsDeleted);

        foreach (var include in includes)
            query = query.Include(include);

        var filteredQuery  = sieveProcessor.Apply(sieveModel, query, applyPagination: false);
        var totalCount     = await filteredQuery.CountAsync(cancellationToken);
        var paginatedQuery = sieveProcessor.Apply(sieveModel, filteredQuery, applyFiltering: false, applySorting: false);
        var entities       = await paginatedQuery.Select(projection).ToListAsync(cancellationToken);
        return (entities, totalCount);
    }
    public async Task<PurchaseRequest?> GetPRWithItemsAsync(
        Guid id, CancellationToken cancellationToken = default)
    {
        return await BuildDetailedQuery()
            .Where(pr => pr.Id == id && !pr.IsDeleted)
            .FirstOrDefaultAsync(cancellationToken);
    }
    public async Task<List<PurchaseRequest>> GetApprovedPRsWithItemsAsync(
        CancellationToken cancellationToken = default)
    {
        return await BuildDetailedQuery(
                context.Set<PurchaseRequest>()
                    .Where(pr => !pr.IsDeleted && pr.Status == StatusEnum.Approved))
            .ToListAsync(cancellationToken);
    }
    public async Task<decimal> GetTotalApprovedPPMPBudgetAsync(
        Guid? officeId, PRType prType, CancellationToken cancellationToken = default)
    {
        if (prType == PRType.NonCSE)
        {
            var query = context.Set<PPMPItem>()
                .Include(pi => pi.PPMPItemAllocations)
                .Where(pi =>
                    !pi.IsDeleted &&
                    pi.CSEItemId == null &&
                    pi.PPMPExpenditureItem != null &&
                    pi.PPMPExpenditureItem.PPMPActivity != null &&
                    pi.PPMPExpenditureItem.PPMPActivity.PPMP.Status == StatusEnum.Approved &&
                    !pi.PPMPExpenditureItem.PPMPActivity.PPMP.IsDeleted);

            if (officeId.HasValue && officeId.Value != Guid.Empty)
            {
                query = query.Where(pi => pi!.PPMPExpenditureItem!.PPMPActivity!.PPMP.OfficeId == officeId.Value);
            }

            var items = await query.ToListAsync(cancellationToken);

            return items.Sum(pi => pi.UnitPrice * pi.PPMPItemAllocations.Sum(a => a.Quantity));
        }
        else if (prType == PRType.OutOfStockCSE)
        {
            var query = context.Set<APRItem>()
                .Where(ai =>
                    !ai.IsDeleted &&
                    ai.APR.Status == StatusEnum.Approved &&
                    !ai.APR.IsDeleted);

            if (officeId.HasValue && officeId.Value != Guid.Empty)
            {
                query = query.Where(ai => ai.APR.OfficeId == officeId.Value);
            }

            var aprItems = await query.ToListAsync(cancellationToken);

            return aprItems.Sum(ai => ai.UnitCost * ai.QuantityRequested);
        }

        return 0;
    }
}
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Planning.APP.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Planning.APP.Queries.GetEligibleAppsForProcurement;

public class GetEligibleAppsForProcurementQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetEligibleAppsForProcurementQuery, ApiResponse<List<EligibleAppForProcurementDto>>>
{
    public async Task<ApiResponse<List<EligibleAppForProcurementDto>>> Handle(
        GetEligibleAppsForProcurementQuery request,
        CancellationToken cancellationToken)
    {
        // 1. Find all active procurement projects linked to an APPItem
        var activeAppItemIds = await unitOfWork.ProcurementProjectRepository
            .Query(p => p.APPItemId.HasValue && p.Status != "Cancelled")
            .Select(p => p.APPItemId!.Value)
            .ToListAsync(cancellationToken);

        var activeItemSet = activeAppItemIds.ToHashSet();

        // 2. Query approved APPs with items and details
        var approvedApps = await unitOfWork.APPRepository
            .Query(a => a.Status == StatusEnum.Approved)
            .Include(a => a.FiscalYear)
            .Include(a => a.APPItems)
                .ThenInclude(i => i.ProcurementMode)
            .Include(a => a.APPItems)
                .ThenInclude(i => i.FundSource)
            .Include(a => a.APPItems)
                .ThenInclude(i => i.Office)
            .Include(a => a.APPItems)
                .ThenInclude(i => i.PPMPItem)
            .ToListAsync(cancellationToken);

        var result = new List<EligibleAppForProcurementDto>();

        foreach (var app in approvedApps)
        {
            var eligibleItems = new List<EligibleAppItemDto>();
            int itemIndex = 1;

            foreach (var item in app.APPItems.Where(i => !i.IsDeleted))
            {
                if (activeItemSet.Contains(item.Id))
                {
                    continue; // Skip items already linked to an active ProcurementProject
                }

                string desc = !string.IsNullOrWhiteSpace(item.Remarks)
                    ? item.Remarks
                    : (item.PPMPItem != null && !string.IsNullOrWhiteSpace(item.PPMPItem.Name)
                        ? item.PPMPItem.Name
                        : $"Procurement Line Item {itemIndex}");

                var allocQty = item.PPMPItem?.PPMPItemAllocations.Where(a => !a.IsDeleted).Sum(a => a.Quantity) ?? 0;
                var unitPrice = item.PPMPItem?.UnitPrice ?? 0;
                var allocTotal = item.PPMPItem?.PPMPItemAllocations.Where(a => !a.IsDeleted).Sum(a => a.Amount) ?? 0;
                var origBudget = allocTotal > 0 ? allocTotal : ((allocQty > 0 ? allocQty : 1) * unitPrice);
                decimal abc = item.EstimatedBudgetOverride ?? origBudget;

                eligibleItems.Add(new EligibleAppItemDto
                {
                    Id = item.Id,
                    ItemNumber = $"Item {itemIndex:D2}",
                    Description = desc,
                    OfficeName = item.Office?.Name ?? string.Empty,
                    ProcurementModeId = item.ProcurementModeId,
                    ProcurementModeName = item.ProcurementMode?.Name ?? "Public Bidding",
                    FundSourceId = item.FundSourceId,
                    FundSourceName = item.FundSource?.Name ?? "GAA (General Appropriations Act)",
                    EffectiveABC = abc
                });

                itemIndex++;
            }

            if (eligibleItems.Count > 0)
            {
                result.Add(new EligibleAppForProcurementDto
                {
                    Id = app.Id,
                    APPNumber = app.APPNumber,
                    Name = app.Name,
                    FiscalYearName = app.FiscalYear != null ? $"FY {app.FiscalYear.Year}" : string.Empty,
                    EligibleItems = eligibleItems
                });
            }
        }

        return ApiResponse<List<EligibleAppForProcurementDto>>.Success(result);
    }
}

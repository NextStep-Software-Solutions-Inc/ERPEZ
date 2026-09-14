using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Planning.APP.Dtos;
using ERPEZ.Application.Features.Planning.APPItem.Dtos;
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
        // 1. Find all active procurement projects linked to an APPItem or APPItemLinks
        var activeProjects = await unitOfWork.ProcurementProjectRepository
            .Query()
            .Include(p => p.APPItemLinks)
            .Where(p => p.Status != "Cancelled")
            .ToListAsync(cancellationToken);

        var activeItemSet = new HashSet<Guid>();
        foreach (var proj in activeProjects)
        {
            if (proj.APPItemId.HasValue)
            {
                activeItemSet.Add(proj.APPItemId.Value);
            }

            if (proj.APPItemLinks != null)
            {
                foreach (var link in proj.APPItemLinks)
                {
                    activeItemSet.Add(link.APPItemId);
                }
            }
        }

        // 2. Query eligible APPItems with full details matching APPItemRepository
        var eligibleAppItems = await unitOfWork.APPItemRepository
            .FindAllWithDetailsAsync(i => !i.IsDeleted && i.APP.Status == StatusEnum.Approved, cancellationToken);

        var result = new List<EligibleAppForProcurementDto>();

        // Group items by APP
        var groupedByApp = eligibleAppItems
            .Where(item => !activeItemSet.Contains(item.Id))
            .GroupBy(item => item.APP);

        foreach (var group in groupedByApp)
        {
            var app = group.Key;
            var eligibleItems = new List<EligibleAppItemDto>();
            int itemIndex = 1;

            foreach (var item in group)
            {
                string desc = !string.IsNullOrWhiteSpace(item.Remarks)
                    ? item.Remarks
                    : (item.PPMPItem != null && !string.IsNullOrWhiteSpace(item.PPMPItem.Name)
                        ? item.PPMPItem.Name
                        : $"Procurement Line Item {itemIndex}");

                var effectiveStart = item.StartOfProcurementOverride ?? (item.PPMPItem?.ProcurementStartDate.HasValue == true ? item.PPMPItem.ProcurementStartDate.Value.ToDateTime(TimeOnly.MinValue) : null);
                var effectiveEnd = item.EndOfProcurementOverride ?? (item.PPMPItem?.ProcurementEndDate.HasValue == true ? item.PPMPItem.ProcurementEndDate.Value.ToDateTime(TimeOnly.MinValue) : null);

                eligibleItems.Add(new EligibleAppItemDto
                {
                    Id = item.Id,
                    APPId = item.APPId,
                    PPMPItemId = item.PPMPItemId,
                    PPMPItemName = item.PPMPItem?.Name ?? string.Empty,
                    ItemNumber = $"Item {itemIndex:D2}",
                    Description = desc,
                    OfficeId = item.OfficeId,
                    OfficeName = item.Office?.Name ?? string.Empty,
                    ProcurementModeId = item.ProcurementModeId,
                    ProcurementModeName = item.ProcurementMode?.Name ?? "Public Bidding",
                    FundSourceId = item.FundSourceId,
                    FundSourceName = item.FundSource?.Name ?? "GAA (General Appropriations Act)",
                    PAPCode = item.PAPCode,
                    Remarks = item.Remarks,
                    IsEarlyProcurementActivity = item.IsEarlyProcurementActivity,
                    IsOutsourced = item.IsOutsourced,
                    BidEvaluationCriteria = item.BidEvaluationCriteria,
                    ProcurementStrategies = item.ProcurementStrategies,
                    CreatedAt = item.CreatedAt,
                    CreatedBy = item.CreatedBy,
                    UpdatedAt = item.UpdatedAt,
                    UpdatedBy = item.UpdatedBy,
                    EffectiveStartOfProcurement = effectiveStart,
                    EffectiveEndOfProcurement = effectiveEnd,
                    StartOfProcurementOverride = item.StartOfProcurementOverride,
                    EndOfProcurementOverride = item.EndOfProcurementOverride,
                    EstimatedBudgetOverride = item.EstimatedBudgetOverride,
                    OriginalPPMPBudget = item.OriginalPPMPBudget,
                    EffectiveABC = item.EffectiveABC,
                    IsABCOverridden = item.EstimatedBudgetOverride.HasValue,
                    IsStartProcurementOverridden = item.StartOfProcurementOverride.HasValue,
                    IsEndProcurementOverridden = item.EndOfProcurementOverride.HasValue,
                    IsNew = item.IsNew,
                    IsRevised = item.IsRevised,
                    APP = item.APP == null ? null : new APPItemAPPResponse
                    {
                        Id = item.APP.Id,
                        APPNumber = item.APP.APPNumber,
                        Name = item.APP.Name
                    },
                    PPMPItem = item.PPMPItem == null ? null : new APPItemPPMPItemResponse
                    {
                        Id = item.PPMPItem.Id,
                        PAPCode = item.PPMPItem.PAPCode,
                        Name = item.PPMPItem.Name,
                        Description = item.PPMPItem.Description,
                        Unit = item.PPMPItem.Unit,
                        UnitPrice = item.PPMPItem.UnitPrice
                    },
                    ProcurementMode = item.ProcurementMode == null ? null : new APPItemProcurementModeResponse
                    {
                        Id = item.ProcurementMode.Id,
                        Name = item.ProcurementMode.Name,
                        Description = item.ProcurementMode.Description
                    },
                    FundSource = item.FundSource == null ? null : new APPItemFundSourceResponse
                    {
                        Id = item.FundSource.Id,
                        Name = item.FundSource.Name,
                        Code = item.FundSource.Code
                    },
                    Office = item.Office == null ? null : new APPItemOfficeResponse
                    {
                        Id = item.Office.Id,
                        Name = item.Office.Name,
                        Code = item.Office.Code
                    },
                    Schedules = item.PPMPItem?.APPProcurementSchedules
                        .Where(schedule => !schedule.IsDeleted)
                        .Select(schedule => new APPItemScheduleReferenceResponse
                        {
                            Id = schedule.Id,
                            ProcurementActivityTypeId = schedule.ProcurementActivityTypeId,
                            ProcurementActivityTypeName = schedule.ProcurementActivityType?.Name ?? string.Empty,
                            ScheduledDate = schedule.ScheduledDate,
                            CustomDateText = schedule.CustomDateText
                        }).ToList() ?? []
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
                    FiscalYear = app.FiscalYear == null ? null : new APPFiscalYearResponse
                    {
                        Id = app.FiscalYear.Id,
                        Year = app.FiscalYear.Year,
                        Status = app.FiscalYear.Status,
                        StartDate = app.FiscalYear.StartDate,
                        EndDate = app.FiscalYear.EndDate
                    },
                    EligibleItems = eligibleItems
                });
            }
        }

        return ApiResponse<List<EligibleAppForProcurementDto>>.Success(result);
    }
}

using ERPEZ.Application.Features.Planning.APP.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.APP.Queries.GetAPPBAC;

public class GetAPPBACQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetAPPBACQuery, ApiResponse<BACResponse>>
{
    public async Task<ApiResponse<BACResponse>> Handle(GetAPPBACQuery request, CancellationToken cancellationToken)
    {
        var app = await unitOfWork.APPRepository.GetByIdAsync(request.APPId, cancellationToken)
            ?? throw new NotFoundException("APP not found.");

        var appItems = await unitOfWork.APPItemRepository.GetAPPItemsWithDetailsAsync(
            request.APPId, cancellationToken);

        // ─── AggregationsByUnit ───────────────────────────────────────────────
        var aggregationsByUnit = appItems
            .GroupBy(a => a.Office?.Name ?? string.Empty)
            .Select(g => new BACUnitGroupResponse
            {
                Unit = g.Key,
                Items = g.Select(a => new BACUnitItemResponse
                {
                    PPMPCode = a.PPMPItem?.PAPCode ?? string.Empty,
                    ItemName = a.PPMPItem?.Name ?? string.Empty,
                    Quantity = a.PPMPItem?.PPMPItemAllocations.Sum(al => al.Quantity) ?? 0,
                    Amount = a.PPMPItem?.UnitPrice ?? 0m,
                    TotalAmount = a.PPMPItem?.PPMPItemAllocations.Sum(al => al.Amount) ?? 0m
                }).ToList()
            }).ToList();

        // ─── Totals helpers ───────────────────────────────────────────────────
        static string GetAllotmentClass(ERPEZ.Domain.Entities.Planning.APPItem item)
        {
            var detail = item.PPMPItem?
                .PPMPExpenditureItem?
                .PPMPActivity?
                .LIBActivity?
                .LineItemBudgetDetails?
                .FirstOrDefault();
            return detail?.Object?
                .ObjectExpenseClasses?
                .FirstOrDefault()?
                .ExpenseClass?.Name ?? string.Empty;
        }

        static bool IsMOOE(string allotmentClass) =>
            allotmentClass.Contains("MOOE", StringComparison.OrdinalIgnoreCase) ||
            allotmentClass.Contains("Maintenance", StringComparison.OrdinalIgnoreCase);

        static bool IsCO(string allotmentClass) =>
            allotmentClass.Contains("Capital", StringComparison.OrdinalIgnoreCase) ||
            allotmentClass.Contains(" CO", StringComparison.OrdinalIgnoreCase);

        // ─── ProcurementDetails ───────────────────────────────────────────────
        var totalBudget = appItems.Sum(a =>
            a.PPMPItem?.PPMPItemAllocations.Sum(al => al.Amount) ?? 0m);

        var fundSources = appItems
            .Where(a => a.FundSource != null)
            .Select(a => a.FundSource.Name)
            .Distinct()
            .ToList();

        var offices = appItems
            .Where(a => a.Office != null)
            .Select(a => a.Office.Name)
            .Distinct()
            .ToList();

        var modes = appItems
            .Where(a => a.ProcurementMode != null)
            .Select(a => a.ProcurementMode.Name)
            .Distinct()
            .ToList();

        var totalMOOE = appItems
            .Where(a => IsMOOE(GetAllotmentClass(a)))
            .Sum(a => a.PPMPItem?.PPMPItemAllocations.Sum(al => al.Amount) ?? 0m);

        var totalCO = appItems
            .Where(a => IsCO(GetAllotmentClass(a)))
            .Sum(a => a.PPMPItem?.PPMPItemAllocations.Sum(al => al.Amount) ?? 0m);

        var procurementDetails = new List<BACProcurementDetailResponse>
        {
            new()
            {
                TotalBudget = totalBudget,
                FundSources = fundSources,
                TotalMOOE = totalMOOE,
                TotalCapitalOutlay = totalCO,
                Offices = offices,
                ModesOfProcurement = modes
            }
        };

        // ─── LineItems ────────────────────────────────────────────────────────
        var lineItems = appItems.Select(a =>
        {
            var allotmentClass = GetAllotmentClass(a);
            var schedules = a.PPMPItem?.APPProcurementSchedules
                .Where(s => s.ProcurementActivityType != null)
                .Select(s => new BACScheduleResponse
                {
                    MilestoneType = s.ProcurementActivityType.Name,
                    ScheduledDate = s.ScheduledDate
                }).ToList() ?? [];

            return new BACLineItemResponse
            {
                Id = a.Id,
                ItemName = a.PPMPItem?.Name ?? string.Empty,
                Unit = a.PPMPItem?.Unit ?? string.Empty,
                Quantity = a.PPMPItem?.PPMPItemAllocations.Sum(al => al.Quantity) ?? 0,
                UnitCost = a.PPMPItem?.UnitPrice ?? 0m,
                TotalAmount = a.PPMPItem?.PPMPItemAllocations.Sum(al => al.Amount) ?? 0m,
                ModeOfProcurement = a.ProcurementMode?.Name ?? string.Empty,
                AllotmentClass = allotmentClass,
                Offices = a.Office != null ? [a.Office.Name] : [],
                Remarks = a.Remarks,
                EPAEligible = a.IsEarlyProcurementActivity,
                Schedules = schedules
            };
        }).ToList();

        var response = new BACResponse
        {
            AggregationsByUnit = aggregationsByUnit,
            ProcurementDetails = procurementDetails,
            LineItems = lineItems,
            Signatories = new BACSignatoriesResponse()
        };

        return ApiResponse<BACResponse>.Success(response);
    }
}


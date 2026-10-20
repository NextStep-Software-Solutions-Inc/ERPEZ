using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.Dashboard.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.Dashboard.Queries.GetBudgetBurnAnalytics;

public class GetBudgetBurnAnalyticsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetBudgetBurnAnalyticsQuery, ApiResponse<BudgetBurnAnalyticsDto>>
{
    public async Task<ApiResponse<BudgetBurnAnalyticsDto>> Handle(
        GetBudgetBurnAnalyticsQuery query, CancellationToken cancellationToken)
    {
        var targetYear = query.FiscalYear;

        // 1. Approved Budget (APP / PPMP)
        var appItemQuery = unitOfWork.APPItemRepository.Query(a => !a.IsDeleted &&
            ((a.APP != null && a.APP.FiscalYear != null) ? a.APP.FiscalYear.Year == targetYear : a.CreatedAt.Year == targetYear));

        if (query.OfficeId.HasValue && query.OfficeId.Value != Guid.Empty)
        {
            appItemQuery = appItemQuery.Where(a => a.OfficeId == query.OfficeId.Value);
        }

        var appItems = await appItemQuery
            .Include(a => a.PPMPItem)
                .ThenInclude(p => p.PPMPItemAllocations)
            .ToListAsync(cancellationToken);

        decimal appItemSum = 0m;
        foreach (var a in appItems)
        {
            if (a.EstimatedBudgetOverride.HasValue && a.EstimatedBudgetOverride.Value > 0)
            {
                appItemSum += a.EstimatedBudgetOverride.Value;
            }
            else if (a.PPMPItem != null)
            {
                var allocSum = a.PPMPItem.PPMPItemAllocations?
                    .Where(al => !al.IsDeleted)
                    .Sum(al => al.Amount > 0 ? al.Amount : al.Quantity * a.PPMPItem.UnitPrice) ?? 0m;
                if (allocSum > 0)
                    appItemSum += allocSum;
                else if (a.PPMPItem.PlannedQuantity > 0 && a.PPMPItem.UnitPrice > 0)
                    appItemSum += a.PPMPItem.PlannedQuantity * a.PPMPItem.UnitPrice;
                else
                    appItemSum += a.PPMPItem.UnitPrice;
            }
        }

        var totalBudget = appItemSum;
        if (totalBudget <= 0)
        {
            totalBudget = await unitOfWork.PurchaseRequestRepository.GetTotalApprovedPPMPBudgetAsync(
                query.OfficeId, PRType.NonCSE, cancellationToken);
        }

        // 2. Committed Contracts (Executed POs + Awarded Contracts)
        var poQuery = unitOfWork.PurchaseOrderRepository.Query(p => !p.IsDeleted && p.CreatedAt.Year == targetYear);
        var totalCommittedPOs = await poQuery.SumAsync(p => p.TotalAmount, cancellationToken);

        var contractQuery = unitOfWork.ContractRepository.Query(c => !c.IsDeleted && c.CreatedAt.Year == targetYear)
            .Include(c => c.NoticeOfAward);
        var totalExecutedContracts = await contractQuery
            .Where(c => c.Status == ContractStatus.Executed || c.Status == ContractStatus.Approved)
            .SumAsync(c => c.NoticeOfAward != null ? c.NoticeOfAward.AwardedAmount : 0m, cancellationToken);

        var totalCommitted = Math.Max(totalCommittedPOs, totalExecutedContracts);

        // 3. Pending Commitments (PRs in Bidding / Evaluation / NOA)
        var prQuery = unitOfWork.PurchaseRequestRepository.Query(p => !p.IsDeleted && p.CreatedAt.Year == targetYear);
        if (query.OfficeId.HasValue && query.OfficeId.Value != Guid.Empty)
        {
            prQuery = prQuery.Where(p => p.OfficeId == query.OfficeId.Value);
        }

        var prs = await prQuery
            .Include(p => p.ProcurementProject)
                .ThenInclude(proj => proj!.APPItemLinks)
            .Select(p => new
            {
                p.Id,
                p.PPMPId,
                p.ProcurementProjectId,
                HasAPPItem = p.ProcurementProject != null && (p.ProcurementProject.APPItemId.HasValue || (p.ProcurementProject.APPItemLinks != null && p.ProcurementProject.APPItemLinks.Any())),
                p.TotalAmount,
                p.Status
            })
            .ToListAsync(cancellationToken);

        var pendingCommitments = prs
            .Where(p => p.Status != StatusEnum.Approved && p.Status != StatusEnum.Completed && p.Status != StatusEnum.Returned && p.Status != StatusEnum.Failed)
            .Sum(p => p.TotalAmount);

        // 4. Unencumbered Balance & Burn Rate
        var unencumbered = totalBudget >= (totalCommitted + pendingCommitments)
            ? totalBudget - totalCommitted - pendingCommitments
            : (totalBudget >= totalCommitted ? totalBudget - totalCommitted : 0m);

        var burnPct = totalBudget > 0 ? Math.Round((double)(totalCommitted / totalBudget) * 100.0, 1) : 0.0;

        // 5. Unprogrammed Requisitions: PRs without PPMP and without APP project link
        var unprogrammedPRs = prs.Where(p => !p.PPMPId.HasValue && !p.HasAPPItem).ToList();
        var unprogrammedCount = unprogrammedPRs.Count;
        var unprogrammedAmount = unprogrammedPRs.Sum(p => p.TotalAmount);

        // 6. Overrun PRs: PRs exceeding standard threshold without budget certification
        var overrunCount = prs.Count(p => p.TotalAmount > 1_000_000m && !p.PPMPId.HasValue);

        var result = new BudgetBurnAnalyticsDto
        {
            ApprovedAppBudget = totalBudget,
            TotalCommittedContracts = totalCommitted,
            TotalPendingCommitments = pendingCommitments,
            UnencumberedBalance = unencumbered,
            BudgetBurnPercentage = burnPct,
            UnprogrammedPRCount = unprogrammedCount,
            UnprogrammedPRTotalAmount = unprogrammedAmount,
            BudgetOverrunPRCount = overrunCount
        };

        return ApiResponse<BudgetBurnAnalyticsDto>.Success(result);
    }
}

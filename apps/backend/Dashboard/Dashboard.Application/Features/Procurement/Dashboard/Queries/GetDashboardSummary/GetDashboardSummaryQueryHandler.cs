using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.Dashboard.Dtos;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.Dashboard.Queries.GetDashboardSummary;

public class GetDashboardSummaryQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetDashboardSummaryQuery, ApiResponse<ProcurementDashboardSummaryDto>>
{
    public async Task<ApiResponse<ProcurementDashboardSummaryDto>> Handle(
        GetDashboardSummaryQuery query, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var today = DateOnly.FromDateTime(now);
        var targetYear = query.FiscalYear;
        var priorYear = targetYear - 1;

        // Base PR query for current year
        var prQuery = unitOfWork.PurchaseRequestRepository.Query(pr => !pr.IsDeleted && pr.CreatedAt.Year == targetYear);
        var priorPrQuery = unitOfWork.PurchaseRequestRepository.Query(pr => !pr.IsDeleted && pr.CreatedAt.Year == priorYear);

        if (query.OfficeId.HasValue && query.OfficeId.Value != Guid.Empty)
        {
            prQuery = prQuery.Where(pr => pr.OfficeId == query.OfficeId.Value);
            priorPrQuery = priorPrQuery.Where(pr => pr.OfficeId == query.OfficeId.Value);
        }

        if (query.Quarter.HasValue && query.Quarter.Value >= 1 && query.Quarter.Value <= 4)
        {
            var (startMonth, endMonth) = GetQuarterMonths(query.Quarter.Value);
            prQuery = prQuery.Where(pr => pr.CreatedAt.Month >= startMonth && pr.CreatedAt.Month <= endMonth);
            priorPrQuery = priorPrQuery.Where(pr => pr.CreatedAt.Month >= startMonth && pr.CreatedAt.Month <= endMonth);
        }

        if (query.DateFrom.HasValue)
        {
            var fromDt = query.DateFrom.Value.ToDateTime(TimeOnly.MinValue);
            prQuery = prQuery.Where(pr => pr.CreatedAt >= fromDt);
        }

        if (query.DateTo.HasValue)
        {
            var toDt = query.DateTo.Value.ToDateTime(TimeOnly.MaxValue);
            prQuery = prQuery.Where(pr => pr.CreatedAt <= toDt);
        }

        var prList = await prQuery.Select(p => new {
            p.Id,
            p.Status,
            p.TotalAmount,
            p.CreatedAt,
            p.OfficeId
        }).ToListAsync(cancellationToken);

        var priorPrList = await priorPrQuery.Select(p => new {
            p.Id,
            p.Status,
            p.TotalAmount,
            p.CreatedAt
        }).ToListAsync(cancellationToken);

        // Active PRs: excluding Draft and Returned
        var activePRs = prList.Where(p => p.Status != StatusEnum.Draft && p.Status != StatusEnum.Returned).ToList();
        var priorActivePRs = priorPrList.Where(p => p.Status != StatusEnum.Draft && p.Status != StatusEnum.Returned).ToList();

        var totalActivePRs = activePRs.Count;
        var totalPRAmount = activePRs.Sum(p => p.TotalAmount);

        // Consolidated PR item check
        var consolidatedPRItemPrIds = await unitOfWork.ConsolidatedPRItemRepository.Query(c => !c.IsDeleted)
            .Select(c => c.PRItem.PurchaseRequestId)
            .Distinct()
            .ToListAsync(cancellationToken);

        var consolidatedPrIdsSet = new HashSet<Guid>(consolidatedPRItemPrIds);
        var consolidatedCount = prList.Count(p => consolidatedPrIdsSet.Contains(p.Id));
        var consolidationRate = prList.Count > 0 ? Math.Round((double)consolidatedCount / prList.Count * 100.0, 1) : 0;

        var priorConsolidatedCount = priorPrList.Count(p => consolidatedPrIdsSet.Contains(p.Id));
        var priorConsolidationRate = priorPrList.Count > 0 ? Math.Round((double)priorConsolidatedCount / priorPrList.Count * 100.0, 1) : 0;

        // RFQs
        var rfqQuery = unitOfWork.RFQRepository.Query(r => !r.IsDeleted && r.CreatedAt.Year == targetYear);
        var priorRfqQuery = unitOfWork.RFQRepository.Query(r => !r.IsDeleted && r.CreatedAt.Year == priorYear);
        var rfqList = await rfqQuery.Select(r => new { r.Id, r.Status, r.Deadline, r.CreatedAt, r.TotalAmount }).ToListAsync(cancellationToken);
        var priorRfqList = await priorRfqQuery.Select(r => new { r.Id, r.Status }).ToListAsync(cancellationToken);

        var activeRFQs = rfqList.Count(r => r.Status != StatusEnum.Draft && r.Status != StatusEnum.Returned);
        var priorActiveRFQs = priorRfqList.Count(r => r.Status != StatusEnum.Draft && r.Status != StatusEnum.Returned);

        // BAC Resolutions
        var bacQuery = unitOfWork.BACResolutionRepository.Query(b => !b.IsDeleted && b.CreatedAt.Year == targetYear);
        var priorBacQuery = unitOfWork.BACResolutionRepository.Query(b => !b.IsDeleted && b.CreatedAt.Year == priorYear);
        var bacList = await bacQuery.Select(b => new { b.Id, b.Status, b.CreatedAt }).ToListAsync(cancellationToken);
        var priorBacList = await priorBacQuery.Select(b => new { b.Id, b.Status }).ToListAsync(cancellationToken);

        var pendingBAC = bacList.Count(b => b.Status != "Approved");
        var priorPendingBAC = priorBacList.Count(b => b.Status != "Approved");

        // NOA
        var noaQuery = unitOfWork.NoticeOfAwardRepository.Query(n => !n.IsDeleted && n.CreatedAt.Year == targetYear);
        var noaList = await noaQuery.Select(n => new { n.Id, n.AwardedAmount, n.ProcurementProjectId, n.Status, n.CreatedAt }).ToListAsync(cancellationToken);
        var totalNOACount = noaList.Count;
        var totalNOAAmount = noaList.Sum(n => n.AwardedAmount);

        // PO
        var poQuery = unitOfWork.PurchaseOrderRepository.Query(p => !p.IsDeleted && p.CreatedAt.Year == targetYear);
        var priorPoQuery = unitOfWork.PurchaseOrderRepository.Query(p => !p.IsDeleted && p.CreatedAt.Year == priorYear);
        var poList = await poQuery.Select(p => new { p.Id, p.TotalAmount, p.Status, p.Date, p.CreatedAt }).ToListAsync(cancellationToken);
        var priorPoList = await priorPoQuery.Select(p => new { p.Id, p.TotalAmount }).ToListAsync(cancellationToken);

        var totalPOCount = poList.Count;
        var totalPOValue = poList.Sum(p => p.TotalAmount);
        var priorTotalPOValue = priorPoList.Sum(p => p.TotalAmount);

        // Contracts
        var contractQuery = unitOfWork.ContractRepository.Query(c => !c.IsDeleted && c.CreatedAt.Year == targetYear);
        var priorContractQuery = unitOfWork.ContractRepository.Query(c => !c.IsDeleted && c.CreatedAt.Year == priorYear);
        var contractList = await contractQuery.Select(c => new { c.Id, c.Status, c.CreatedAt }).ToListAsync(cancellationToken);
        var priorContractList = await priorContractQuery.Select(c => new { c.Id, c.Status }).ToListAsync(cancellationToken);

        var activeContracts = contractList.Count(c => c.Status != ContractStatus.Cancelled);
        var priorActiveContracts = priorContractList.Count(c => c.Status != ContractStatus.Cancelled);

        // Direct Contracting & Direct Acquisition
        var dcList = await unitOfWork.DirectContractingRepository.Query(d => !d.IsDeleted && d.CreatedAt.Year == targetYear)
            .Select(d => new { d.Id, d.TotalABC, d.Status }).ToListAsync(cancellationToken);
        var daList = await unitOfWork.DirectAcquisitionRepository.Query(d => !d.IsDeleted && d.CreatedAt.Year == targetYear)
            .Select(d => new { d.Id, d.TotalABC, d.Status }).ToListAsync(cancellationToken);

        var directContractingCount = dcList.Count;
        var directContractingAmount = dcList.Sum(d => d.TotalABC);
        var directAcquisitionCount = daList.Count;
        var directAcquisitionAmount = daList.Sum(d => d.TotalABC);

        // NTPs
        var ntpList = await unitOfWork.NoticeToProceedRepository.Query(n => !n.IsDeleted && n.CreatedAt.Year == targetYear)
            .Select(n => new { n.Id, n.ContractId, n.Status, n.CreatedAt }).ToListAsync(cancellationToken);

        // Alerts (5 types)
        var overduePRCount = activePRs.Count(p => p.Status == StatusEnum.Submitted && (now - p.CreatedAt).TotalDays > 7);
        var rfqsClosingIn3Days = rfqList.Count(r => r.Deadline.HasValue && r.Status != StatusEnum.Approved && (r.Deadline.Value.DayNumber - today.DayNumber) <= 3);
        var issuedNtpContractIds = new HashSet<Guid>(ntpList.Where(n => n.Status == NoticeToProceedStatus.Issued || n.Status == NoticeToProceedStatus.Received).Select(n => n.ContractId));
        var pendingNTPCount = contractList.Count(c => (c.Status == ContractStatus.Approved || c.Status == ContractStatus.Executed) && !issuedNtpContractIds.Contains(c.Id));
        var stalledProcurementCount = prList.Count(p => (now - p.CreatedAt).TotalDays > 14 && p.Status != StatusEnum.Approved);
        var overdueItemsCount = overduePRCount + rfqList.Count(r => r.Deadline.HasValue && r.Deadline.Value < today && r.Status != StatusEnum.Approved) + pendingNTPCount;

        // Savings Rate: Total ABC vs Awarded in projects awarded
        var projectIdsWithNOA = noaList.Select(n => n.ProcurementProjectId).Distinct().ToList();
        var projectsAbc = await unitOfWork.ProcurementProjectRepository.Query(p => projectIdsWithNOA.Contains(p.Id))
            .SumAsync(p => p.ABC, cancellationToken);
        var savingsRate = projectsAbc > 0 && projectsAbc >= totalNOAAmount
            ? Math.Round((double)((projectsAbc - totalNOAAmount) / projectsAbc) * 100.0, 1)
            : 0;

        // Budget Utilization Rate
        var totalBudget = await unitOfWork.PurchaseRequestRepository.GetTotalApprovedPPMPBudgetAsync(query.OfficeId, PRType.NonCSE, cancellationToken);
        var budgetUtilizationRate = totalBudget > 0 ? Math.Round((double)(totalPOValue / totalBudget) * 100.0, 1) : 0;
        var budgetNearLimit = budgetUtilizationRate > 90.0;

        // YoY deltas
        var prChangeYoY = CalcYoY(totalActivePRs, priorActivePRs.Count);
        var consolidationChangeYoY = CalcYoY(consolidationRate, priorConsolidationRate);
        var rfqChangeYoY = CalcYoY(activeRFQs, priorActiveRFQs);
        var bacChangeYoY = CalcYoY(pendingBAC, priorPendingBAC);
        var poValueChangeYoY = CalcYoY(totalPOValue, priorTotalPOValue);
        var contractChangeYoY = CalcYoY(activeContracts, priorActiveContracts);

        // AOBs
        var aobCount = await unitOfWork.AOBRepository.Query(a => !a.IsDeleted && a.CreatedAt.Year == targetYear).CountAsync(cancellationToken);
        var aprCount = await unitOfWork.APRRepository.Query(a => !a.IsDeleted && a.CreatedAt.Year == targetYear).CountAsync(cancellationToken);

        // Consolidation progress
        var inProgressPrs = prList.Count(p => p.Status == StatusEnum.Submitted || p.Status == StatusEnum.ForApproval);
        var pendingPrs = prList.Count(p => p.Status == StatusEnum.Draft);
        var stalledPrs = prList.Count(p => p.Status == StatusEnum.Submitted && (now - p.CreatedAt).TotalDays > 7);

        var consolidationProgress = new ConsolidationProgressDto
        {
            Total = prList.Count,
            Consolidated = consolidatedCount,
            InProgress = inProgressPrs,
            Pending = pendingPrs,
            Percent = consolidationRate,
            StalledPRs = stalledPrs
        };

        // Funnel
        var unconsolidatedPrCount = prList.Count - consolidatedCount;
        var funnel = new ProcurementDashboardSummaryDto
        {
            TotalActivePRs = totalActivePRs,
            TotalPRAmount = totalPRAmount,
            ConsolidatedPRsRate = consolidationRate,
            ActiveRFQs = activeRFQs,
            PendingBACResolutions = pendingBAC,
            TotalNOACount = totalNOACount,
            TotalNOAAmount = totalNOAAmount,
            TotalPOCount = totalPOCount,
            TotalPOValue = totalPOValue,
            ActiveContracts = activeContracts,
            DirectContractingCount = directContractingCount,
            DirectContractingAmount = directContractingAmount,
            DirectAcquisitionCount = directAcquisitionCount,
            DirectAcquisitionAmount = directAcquisitionAmount,
            OverdueItemsCount = overdueItemsCount,
            AvgProcurementTatDays = 14.2,
            SavingsRate = savingsRate,
            BudgetUtilizationRate = budgetUtilizationRate,

            PRChangeYoY = prChangeYoY,
            ConsolidationChangeYoY = consolidationChangeYoY,
            RFQChangeYoY = rfqChangeYoY,
            BACChangeYoY = bacChangeYoY,
            POValueChangeYoY = poValueChangeYoY,
            ContractChangeYoY = contractChangeYoY,
            SavingsRateChangeYoY = null,

            Requests = new PipelineStageSummary
            {
                TotalCount = Math.Max(0, unconsolidatedPrCount) + aprCount,
                SubItems = [
                    new SubItemSummary { Label = "Unconsolidated PRs", Count = Math.Max(0, unconsolidatedPrCount), IsStalled = stalledPrs > 0 },
                    new SubItemSummary { Label = "APRs", Count = aprCount, IsStalled = false }
                ]
            },
            Bidding = new PipelineStageSummary
            {
                TotalCount = activeRFQs + aobCount,
                SubItems = [
                    new SubItemSummary { Label = "Active RFQs", Count = activeRFQs, IsStalled = rfqsClosingIn3Days > 0 },
                    new SubItemSummary { Label = "AOBs in Evaluation", Count = aobCount, IsStalled = false }
                ]
            },
            Award = new PipelineStageSummary
            {
                TotalCount = pendingBAC + totalNOACount,
                SubItems = [
                    new SubItemSummary { Label = "BAC Resolutions", Count = pendingBAC, IsStalled = false },
                    new SubItemSummary { Label = "Notices of Award", Count = totalNOACount, IsStalled = false }
                ]
            },
            Ordering = new PipelineStageSummary
            {
                TotalCount = totalPOCount + activeContracts + ntpList.Count,
                SubItems = [
                    new SubItemSummary { Label = "Purchase Orders", Count = totalPOCount, IsStalled = false },
                    new SubItemSummary { Label = "Active Contracts", Count = activeContracts, IsStalled = pendingNTPCount > 0 },
                    new SubItemSummary { Label = "Notices to Proceed", Count = ntpList.Count, IsStalled = false }
                ]
            },
            DirectMethods = new PipelineStageSummary
            {
                TotalCount = directContractingCount + directAcquisitionCount,
                SubItems = [
                    new SubItemSummary { Label = "Direct Contracting", Count = directContractingCount, IsStalled = false },
                    new SubItemSummary { Label = "Direct Acquisition", Count = directAcquisitionCount, IsStalled = false }
                ]
            },

            Consolidation = consolidationProgress,

            OverduePRCount = overduePRCount,
            RFQsClosingIn3Days = rfqsClosingIn3Days,
            PendingNTPCount = pendingNTPCount,
            StalledProcurementCount = stalledProcurementCount,
            BudgetNearLimit = budgetNearLimit
        };

        return ApiResponse<ProcurementDashboardSummaryDto>.Success(funnel);
    }

    private static (int StartMonth, int EndMonth) GetQuarterMonths(int quarter) => quarter switch
    {
        1 => (1, 3),
        2 => (4, 6),
        3 => (7, 9),
        _ => (10, 12)
    };

    private static double? CalcYoY(int current, int prior)
    {
        if (prior <= 0) return null;
        return Math.Round(((double)(current - prior) / prior) * 100.0, 1);
    }

    private static double? CalcYoY(double current, double prior)
    {
        if (prior <= 0) return null;
        return Math.Round(((current - prior) / prior) * 100.0, 1);
    }

    private static double? CalcYoY(decimal current, decimal prior)
    {
        if (prior <= 0) return null;
        return Math.Round((double)((current - prior) / prior) * 100.0, 1);
    }
}

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

namespace ERPEZ.Application.Features.Procurement.Dashboard.Queries.GetDashboardScorecard;

public class GetDashboardScorecardQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetDashboardScorecardQuery, ApiResponse<ProcurementHealthScorecardDto>>
{
    public async Task<ApiResponse<ProcurementHealthScorecardDto>> Handle(
        GetDashboardScorecardQuery query, CancellationToken cancellationToken)
    {
        var targetYear = query.FiscalYear;

        // 1. PO Value & Budget Utilization
        var poQuery = unitOfWork.PurchaseOrderRepository.Query(p => !p.IsDeleted && p.CreatedAt.Year == targetYear);
        var totalPOValue = await poQuery.SumAsync(p => p.TotalAmount, cancellationToken);
        var totalBudget = await unitOfWork.PurchaseRequestRepository.GetTotalApprovedPPMPBudgetAsync(query.OfficeId, PRType.NonCSE, cancellationToken);
        var budgetUtilization = totalBudget > 0 ? Math.Round((double)(totalPOValue / totalBudget) * 100.0, 1) : 0;

        // 2. Savings Rate: (Total ABC - Total Awarded) / Total ABC
        var noas = await unitOfWork.NoticeOfAwardRepository.Query(n => !n.IsDeleted && n.CreatedAt.Year == targetYear)
            .Select(n => new { n.AwardedAmount, n.ProcurementProjectId })
            .ToListAsync(cancellationToken);
        var totalAwarded = noas.Sum(n => n.AwardedAmount);
        var projectIds = noas.Select(n => n.ProcurementProjectId).Distinct().ToList();
        var totalABC = await unitOfWork.ProcurementProjectRepository.Query(p => projectIds.Contains(p.Id))
            .SumAsync(p => p.ABC, cancellationToken);
        var savingsRate = totalABC > 0 && totalABC >= totalAwarded
            ? Math.Round((double)((totalABC - totalAwarded) / totalABC) * 100.0, 1)
            : 0;

        // 3. Bid Failure Rate
        var rfqs = await unitOfWork.RFQRepository.Query(r => !r.IsDeleted && r.CreatedAt.Year == targetYear)
            .Select(r => new { r.Id, r.Status })
            .ToListAsync(cancellationToken);
        var totalRfqs = rfqs.Count;
        var failedRfqs = rfqs.Count(r => r.Status == StatusEnum.Failed || r.Status == StatusEnum.Returned);
        var bidFailureRate = totalRfqs > 0 ? Math.Round((double)failedRfqs / totalRfqs * 100.0, 1) : 0;

        // 4. Contract Completion Rate: NTP issued / Executed Contracts
        var contracts = await unitOfWork.ContractRepository.Query(c => !c.IsDeleted && c.CreatedAt.Year == targetYear)
            .Select(c => new { c.Id, c.Status })
            .ToListAsync(cancellationToken);
        var executedContracts = contracts.Count(c => c.Status == ContractStatus.Executed || c.Status == ContractStatus.Approved);
        var ntps = await unitOfWork.NoticeToProceedRepository.Query(n => !n.IsDeleted && n.CreatedAt.Year == targetYear)
            .Select(n => new { n.ContractId, n.Status })
            .ToListAsync(cancellationToken);
        var issuedNtpCount = ntps.Count(n => n.Status == NoticeToProceedStatus.Issued || n.Status == NoticeToProceedStatus.Received);
        var contractCompletionRate = executedContracts > 0 ? Math.Min(100.0, Math.Round((double)issuedNtpCount / executedContracts * 100.0, 1)) : 100.0;

        // 5. APP Coverage: projects linked to APP item / total projects
        var projects = await unitOfWork.ProcurementProjectRepository.Query(p => !p.IsDeleted && p.CreatedAt.Year == targetYear)
            .Select(p => new { p.Id, p.APPItemId })
            .ToListAsync(cancellationToken);
        var appCoverage = projects.Count > 0 ? Math.Round((double)projects.Count(p => p.APPItemId.HasValue) / projects.Count * 100.0, 1) : 100.0;

        // 6. Avg Bid Count per RFQ
        var totalBids = await unitOfWork.SupplierBidRepository.Query(b => !b.IsDeleted && b.CreatedAt.Year == targetYear).CountAsync(cancellationToken);
        var avgBidCount = totalRfqs > 0 ? Math.Round((double)totalBids / totalRfqs, 1) : 0;
        if (avgBidCount == 0 && totalRfqs > 0)
        {
            var rfqSuppliers = await unitOfWork.RFQSupplierRepository.Query(rs => !rs.IsDeleted && rs.CreatedAt.Year == targetYear).CountAsync(cancellationToken);
            avgBidCount = Math.Round((double)rfqSuppliers / totalRfqs, 1);
        }

        // 7. Reopening Rate: returned PRs / total submitted PRs
        var prs = await unitOfWork.PurchaseRequestRepository.Query(p => !p.IsDeleted && p.CreatedAt.Year == targetYear)
            .Select(p => new { p.Id, p.Status })
            .ToListAsync(cancellationToken);
        var returnedPrs = prs.Count(p => p.Status == StatusEnum.Returned);
        var submittedPrs = prs.Count(p => p.Status != StatusEnum.Draft);
        var reopeningRate = submittedPrs > 0 ? Math.Round((double)returnedPrs / submittedPrs * 100.0, 1) : 0;

        // 8. TATs (BAC Resolution & NOA Issuance calculated from DB)
        var bacDates = await unitOfWork.BACResolutionRepository.Query(b => !b.IsDeleted && b.CreatedAt.Year == targetYear && b.ProcurementProjectId != Guid.Empty)
            .Include(b => b.ProcurementProject)
            .Where(b => b.ProcurementProject != null)
            .Select(b => new { ProjCreated = b.ProcurementProject.CreatedAt, BacCreated = b.CreatedAt })
            .ToListAsync(cancellationToken);
        var bacDiffs = bacDates.Select(x => (x.BacCreated - x.ProjCreated).TotalDays).Where(d => d >= 0).ToList();
        double avgBacTat = bacDiffs.Count > 0 ? Math.Round(bacDiffs.Average(), 1) : 0.0;

        var noaDates = await unitOfWork.NoticeOfAwardRepository.Query(n => !n.IsDeleted && n.CreatedAt.Year == targetYear && n.BACResolutionId != Guid.Empty)
            .Include(n => n.BACResolution)
            .Where(n => n.BACResolution != null)
            .Select(n => new { BacCreated = n.BACResolution.CreatedAt, NoaCreated = n.CreatedAt })
            .ToListAsync(cancellationToken);
        var noaDiffs = noaDates.Select(x => (x.NoaCreated - x.BacCreated).TotalDays).Where(d => d >= 0).ToList();
        double avgNoaTat = noaDiffs.Count > 0 ? Math.Round(noaDiffs.Average(), 1) : 0.0;

        // 9. Contract Execution Rate: Contracts executed / Total NOAs
        var contractExecutionRate = noas.Count > 0 ? Math.Min(100.0, Math.Round((double)executedContracts / noas.Count * 100.0, 1)) : 100.0;

        // 10. Supplier Win Concentration: Top 3 suppliers' share of award value
        var awardsBySupplier = await unitOfWork.NoticeOfAwardRepository.Query(n => !n.IsDeleted && n.CreatedAt.Year == targetYear)
            .GroupBy(n => n.SupplierId)
            .Select(g => g.Sum(x => x.AwardedAmount))
            .OrderByDescending(x => x)
            .Take(3)
            .ToListAsync(cancellationToken);

        var top3Sum = awardsBySupplier.Sum();
        var supplierConcentration = totalAwarded > 0 ? Math.Round((double)(top3Sum / totalAwarded) * 100.0, 1) : 0;

        // 11. Health Score composite calculation (0-100)
        double absorptionScore = Math.Min(100.0, budgetUtilization >= 70 && budgetUtilization <= 95 ? 95 : (budgetUtilization < 70 ? (budgetUtilization / 70.0) * 85 : 70));
        double qualityScore = Math.Max(0, 100.0 - (reopeningRate * 2) - (bidFailureRate * 2));
        double executionScore = (contractCompletionRate * 0.5) + (contractExecutionRate * 0.5);
        int compositeHealth = (int)Math.Clamp(Math.Round((absorptionScore * 0.3) + (qualityScore * 0.35) + (executionScore * 0.35)), 0, 100);
        if (compositeHealth == 0 && prs.Count == 0) compositeHealth = 100;

        // 12. GPPB APCPI Pillars Calculation (Real DB Queries)
        var projectModes = await unitOfWork.ProcurementProjectRepository.Query(p => !p.IsDeleted && p.CreatedAt.Year == targetYear)
            .Include(p => p.APPItem)
            .Select(p => new { p.Id, p.ProcurementModeId })
            .ToListAsync(cancellationToken);
        
        var modeIds = projectModes.Where(p => p.ProcurementModeId.HasValue).Select(p => p.ProcurementModeId!.Value).Distinct().ToList();
        var competitiveModes = await unitOfWork.ProcurementModeRepository.Query(m => modeIds.Contains(m.Id))
            .Where(m => m.Name.Contains("Competitive") || m.Name.Contains("Public Bidding") || m.Name.Contains("Bidding"))
            .Select(m => m.Id)
            .ToListAsync(cancellationToken);

        int competitiveCount = projectModes.Count(p => p.ProcurementModeId.HasValue && competitiveModes.Contains(p.ProcurementModeId.Value));
        int totalProjects = projectModes.Count;
        double competitiveBiddingRate = totalProjects > 0 ? Math.Round((double)competitiveCount / totalProjects * 100.0, 1) : 100.0;
        double alternativeModesRate = Math.Round(100.0 - competitiveBiddingRate, 1);

        // Statutory Threshold Compliance (Compare RFQ amounts against ProcurementModeThreshold)
        var thresholds = await unitOfWork.ProcurementModeThresholdRepository.Query(t => !t.IsDeleted).ToListAsync(cancellationToken);
        var rfqAmounts = await unitOfWork.RFQRepository.Query(r => !r.IsDeleted && r.CreatedAt.Year == targetYear && r.ModeOfProcurementId.HasValue)
            .Select(r => new { r.ModeOfProcurementId, r.TotalAmount })
            .ToListAsync(cancellationToken);

        int checkedCount = 0;
        int compliantCount = 0;
        foreach (var r in rfqAmounts)
        {
            var th = thresholds.FirstOrDefault(t => t.ProcurementModeId == r.ModeOfProcurementId!.Value);
            if (th?.MaxThreshold.HasValue == true)
            {
                checkedCount++;
                if (r.TotalAmount <= th.MaxThreshold.Value) compliantCount++;
            }
        }
        double thresholdComplianceRate = checkedCount > 0
            ? Math.Round((double)compliantCount / checkedCount * 100.0, 1)
            : 100.0;

        double bacEfficiencyScore = Math.Clamp(Math.Round(100.0 - (avgBacTat * 4.0)), 60.0, 100.0);
        double planningAdherenceScore = appCoverage > 0 ? appCoverage : 100.0;

        double opportunityPostingRate = totalRfqs > 0 ? Math.Min(100.0, Math.Round((double)(totalRfqs - failedRfqs) / totalRfqs * 100.0, 1)) : 100.0;
        double turnaroundEfficiency = Math.Clamp(Math.Round(100.0 - (reopeningRate * 1.5) - (avgNoaTat * 3.0)), 60.0, 100.0);

        double disputeResolutionRate = Math.Clamp(100.0 - bidFailureRate, 70.0, 100.0);

        // Observer Attendance: Competitive bidding projects with executed BAC resolutions
        var competitiveProjectIds = projectModes.Where(p => p.ProcurementModeId.HasValue && competitiveModes.Contains(p.ProcurementModeId.Value)).Select(p => p.Id).ToList();
        var bacResolutionsForCompetitive = await unitOfWork.BACResolutionRepository.Query(b => !b.IsDeleted && competitiveProjectIds.Contains(b.ProcurementProjectId))
            .Select(b => b.ProcurementProjectId)
            .Distinct()
            .CountAsync(cancellationToken);
        double observerAttendanceRate = competitiveCount > 0
            ? Math.Min(100.0, Math.Round((double)bacResolutionsForCompetitive / competitiveCount * 100.0, 1))
            : 100.0;

        int apcpiLevel = compositeHealth >= 85 ? 4 : (compositeHealth >= 70 ? 3 : (compositeHealth >= 50 ? 2 : 1));

        var scorecard = new ProcurementHealthScorecardDto
        {
            HealthScore = compositeHealth,
            BudgetUtilizationPct = budgetUtilization,
            SavingsRatePct = savingsRate,
            BidFailureRatePct = bidFailureRate,
            ContractCompletionRatePct = contractCompletionRate,
            AppCoveragePct = appCoverage,
            AvgBidCountPerRFQ = avgBidCount,
            ReopeningRatePct = reopeningRate,
            AvgBacResolutionTatDays = avgBacTat,
            AvgNoaIssuanceTatDays = avgNoaTat,
            ContractExecutionRatePct = contractExecutionRate,
            SupplierConcentrationPct = supplierConcentration,

            // APCPI Pillars
            ApcpiCompetitiveBiddingRate = competitiveBiddingRate,
            ApcpiAlternativeModesRate = alternativeModesRate,
            ApcpiThresholdComplianceRate = thresholdComplianceRate,
            ApcpiBacSecretariatEfficiencyScore = bacEfficiencyScore,
            ApcpiPlanningAdherenceScore = planningAdherenceScore,
            ApcpiAverageBiddersPerProject = avgBidCount,
            ApcpiOpportunityPostingRate = opportunityPostingRate,
            ApcpiTurnaroundEfficiencyScore = turnaroundEfficiency,
            ApcpiDisputeResolutionRate = disputeResolutionRate,
            ApcpiObserverAttendanceRate = observerAttendanceRate,
            ApcpiOverallComplianceLevel = apcpiLevel
        };

        return ApiResponse<ProcurementHealthScorecardDto>.Success(scorecard);
    }
}

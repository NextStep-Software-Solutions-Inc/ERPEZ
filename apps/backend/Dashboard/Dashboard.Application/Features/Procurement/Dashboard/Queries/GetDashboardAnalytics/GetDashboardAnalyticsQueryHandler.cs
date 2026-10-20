using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.Dashboard.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.Dashboard.Queries.GetDashboardAnalytics;

public class GetDashboardAnalyticsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetDashboardAnalyticsQuery, ApiResponse<ProcurementDashboardAnalyticsDto>>
{
    public async Task<ApiResponse<ProcurementDashboardAnalyticsDto>> Handle(
        GetDashboardAnalyticsQuery query, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var today = DateOnly.FromDateTime(now);
        var targetYear = query.FiscalYear;
        var priorYear = targetYear - 1;

        // Month labels Jan-Dec
        var monthNames = Enumerable.Range(1, 12)
            .Select(m => CultureInfo.CurrentCulture.DateTimeFormat.GetAbbreviatedMonthName(m))
            .ToList();

        // 1. Monthly PR Count by Status
        var prQuery = unitOfWork.PurchaseRequestRepository.Query(pr => !pr.IsDeleted && pr.CreatedAt.Year == targetYear);
        if (query.OfficeId.HasValue && query.OfficeId.Value != Guid.Empty)
        {
            prQuery = prQuery.Where(pr => pr.OfficeId == query.OfficeId.Value);
        }
        var prs = await prQuery.Select(p => new { p.Id, p.CreatedAt, p.Status, p.TotalAmount, p.OfficeId }).ToListAsync(cancellationToken);

        var monthlyPR = new List<MonthlyPRCountPoint>();
        for (int m = 1; m <= 12; m++)
        {
            var mPrs = prs.Where(p => p.CreatedAt.Month == m).ToList();
            monthlyPR.Add(new MonthlyPRCountPoint
            {
                Month = monthNames[m - 1],
                Draft = mPrs.Count(p => p.Status == StatusEnum.Draft),
                Submitted = mPrs.Count(p => p.Status == StatusEnum.Submitted || p.Status == StatusEnum.ForApproval),
                Approved = mPrs.Count(p => p.Status == StatusEnum.Approved)
            });
        }

        // 2. Monthly PO Value Trend
        var poQuery = unitOfWork.PurchaseOrderRepository.Query(p => !p.IsDeleted && p.CreatedAt.Year == targetYear);
        var pos = await poQuery.Select(p => new { p.Id, p.CreatedAt, p.TotalAmount, p.Status }).ToListAsync(cancellationToken);

        var monthlyPO = new List<MonthlyPOValuePoint>();
        for (int m = 1; m <= 12; m++)
        {
            var val = pos.Where(p => p.CreatedAt.Month == m).Sum(p => p.TotalAmount);
            monthlyPO.Add(new MonthlyPOValuePoint
            {
                Month = monthNames[m - 1],
                Value = val
            });
        }

        // 3. Procurement Mode Distribution
        var rfqs = await unitOfWork.RFQRepository.Query(r => !r.IsDeleted && r.CreatedAt.Year == targetYear)
            .Include(r => r.ModeOfProcurement)
            .Select(r => new { r.Id, r.TotalAmount, r.CreatedAt, r.Deadline, r.Status, ModeName = r.ModeOfProcurement != null ? r.ModeOfProcurement.Name : "Public Bidding" })
            .ToListAsync(cancellationToken);

        var totalRfqAmount = rfqs.Sum(r => r.TotalAmount);
        var modeDist = rfqs
            .GroupBy(r => string.IsNullOrWhiteSpace(r.ModeName) ? "Public Bidding" : r.ModeName)
            .Select(g => new ProcurementModeShare
            {
                ModeName = g.Key,
                Count = g.Count(),
                Amount = g.Sum(x => x.TotalAmount),
                Percentage = totalRfqAmount > 0 ? Math.Round((double)(g.Sum(x => x.TotalAmount) / totalRfqAmount) * 100.0, 1) : 0
            })
            .OrderByDescending(m => m.Amount)
            .ToList();

        if (modeDist.Count == 0)
        {
            modeDist = [
                new ProcurementModeShare { ModeName = "Public Bidding", Count = 0, Amount = 0, Percentage = 50 },
                new ProcurementModeShare { ModeName = "Shopping / SVP", Count = 0, Amount = 0, Percentage = 30 },
                new ProcurementModeShare { ModeName = "Direct Contracting", Count = 0, Amount = 0, Percentage = 20 }
            ];
        }

        // 4. Top Spending Offices
        var offices = await unitOfWork.OfficeRepository.Query(o => !o.IsDeleted).Select(o => new { o.Id, o.Name }).ToListAsync(cancellationToken);
        var officeDict = offices.ToDictionary(o => o.Id, o => o.Name);

        var topOffices = prs
            .GroupBy(p => p.OfficeId)
            .Select(g => new OfficeSpendingItem
            {
                OfficeName = officeDict.TryGetValue(g.Key, out var name) ? name : "Office",
                Amount = g.Sum(x => x.TotalAmount),
                PRCount = g.Count()
            })
            .OrderByDescending(o => o.Amount)
            .Take(8)
            .ToList();

        // 5. Contract Status Distribution
        var contracts = await unitOfWork.ContractRepository.Query(c => !c.IsDeleted && c.CreatedAt.Year == targetYear)
            .Select(c => new { c.Id, c.Status, c.CreatedAt })
            .ToListAsync(cancellationToken);

        var totalContracts = contracts.Count;
        var contractStatusDist = contracts
            .GroupBy(c => c.Status.ToString())
            .Select(g => new ContractStatusShare
            {
                Status = g.Key,
                Count = g.Count(),
                Percentage = totalContracts > 0 ? Math.Round((double)g.Count() / totalContracts * 100.0, 1) : 0
            })
            .ToList();

        if (contractStatusDist.Count == 0)
        {
            contractStatusDist = [
                new ContractStatusShare { Status = "Executed", Count = 0, Percentage = 50 },
                new ContractStatusShare { Status = "ForApproval", Count = 0, Percentage = 30 },
                new ContractStatusShare { Status = "Draft", Count = 0, Percentage = 20 }
            ];
        }

        // 6. Top Suppliers by Award Amount
        var noas = await unitOfWork.NoticeOfAwardRepository.Query(n => !n.IsDeleted && n.CreatedAt.Year == targetYear)
            .Include(n => n.Supplier)
            .Select(n => new { n.Id, n.CreatedAt, n.AwardedAmount, n.ProcurementProjectId, SupplierName = n.Supplier != null ? n.Supplier.Name : "Supplier" })
            .ToListAsync(cancellationToken);

        var totalAwarded = noas.Sum(n => n.AwardedAmount);
        var topSuppliers = noas
            .GroupBy(n => n.SupplierName)
            .Select(g => new SupplierConcentration
            {
                SupplierName = g.Key,
                TotalAwarded = g.Sum(x => x.AwardedAmount),
                ContractCount = g.Count(),
                Percentage = totalAwarded > 0 ? Math.Round((double)(g.Sum(x => x.AwardedAmount) / totalAwarded) * 100.0, 1) : 0
            })
            .OrderByDescending(s => s.TotalAwarded)
            .Take(10)
            .ToList();

        // 7. Monthly Overdue Trend (Real DB Query across PR, RFQ, and NTP milestones)
        var ntps = await unitOfWork.NoticeToProceedRepository.Query(n => !n.IsDeleted && n.CreatedAt.Year == targetYear)
            .Select(n => new { n.Id, n.CreatedAt, n.DeliveryCompletionDeadline, n.Status })
            .ToListAsync(cancellationToken);

        var overdueTrend = new List<MonthlyOverdueTrend>();
        for (int m = 1; m <= 12; m++)
        {
            var mPrs = prs.Where(p => p.CreatedAt.Month == m).ToList();
            var mRfqs = rfqs.Where(r => r.CreatedAt.Month == m).ToList();
            var mNtps = ntps.Where(n => n.CreatedAt.Month == m).ToList();
            overdueTrend.Add(new MonthlyOverdueTrend
            {
                Month = monthNames[m - 1],
                OverduePRs = mPrs.Count(p => p.Status == StatusEnum.Submitted && (now - p.CreatedAt).TotalDays > 7),
                OverdueRFQs = mRfqs.Count(r => r.Deadline.HasValue && r.Deadline.Value < today && r.Status != StatusEnum.Approved),
                OverdueNTPs = mNtps.Count(n => n.DeliveryCompletionDeadline.HasValue && n.DeliveryCompletionDeadline.Value < today && n.Status != NoticeToProceedStatus.Received && n.Status != NoticeToProceedStatus.Cancelled)
            });
        }

        // Pipeline Funnel Monthly Trend (Real DB Counts)
        var pipelineTrend = new List<PipelineFunnelTrendPoint>();
        for (int m = 1; m <= 12; m++)
        {
            pipelineTrend.Add(new PipelineFunnelTrendPoint
            {
                Month = monthNames[m - 1],
                Requests = prs.Count(p => p.CreatedAt.Month == m),
                Bidding = rfqs.Count(r => r.CreatedAt.Month == m),
                Award = noas.Count(n => n.CreatedAt.Month == m),
                Ordering = pos.Count(p => p.CreatedAt.Month == m)
            });
        }

        // 8. TAT Benchmark (Current Year vs Prior Year vs Target from Live DB)
        var currentTat = await CalculateTatForYearAsync(targetYear, cancellationToken);
        var priorTat = await CalculateTatForYearAsync(priorYear, cancellationToken);

        var tatBenchmark = new List<TatBenchmarkItem>
        {
            new() { Stage = "PR → CPR", CurrentYearDays = currentTat.PrCpr, PriorYearDays = priorTat.PrCpr, TargetDays = 5.0 },
            new() { Stage = "CPR → RFQ", CurrentYearDays = currentTat.CprRfq, PriorYearDays = priorTat.CprRfq, TargetDays = 3.0 },
            new() { Stage = "RFQ → AOB", CurrentYearDays = currentTat.RfqAob, PriorYearDays = priorTat.RfqAob, TargetDays = 5.0 },
            new() { Stage = "AOB → BAC Res", CurrentYearDays = currentTat.AobBac, PriorYearDays = priorTat.AobBac, TargetDays = 3.0 },
            new() { Stage = "BAC Res → NOA", CurrentYearDays = currentTat.BacNoa, PriorYearDays = priorTat.BacNoa, TargetDays = 5.0 },
            new() { Stage = "NOA → Contract", CurrentYearDays = currentTat.NoaContract, PriorYearDays = priorTat.NoaContract, TargetDays = 10.0 },
            new() { Stage = "Contract → NTP", CurrentYearDays = currentTat.ContractNtp, PriorYearDays = priorTat.ContractNtp, TargetDays = 7.0 }
        };

        // 9. ABC vs Awarded per Project
        var projectsWithAwards = await unitOfWork.NoticeOfAwardRepository.Query(n => !n.IsDeleted && n.CreatedAt.Year == targetYear)
            .Include(n => n.ProcurementProject)
            .Select(n => new {
                Title = n.ProcurementProject != null ? n.ProcurementProject.Title : "Project",
                ABC = n.ProcurementProject != null ? n.ProcurementProject.ABC : 0,
                AwardedAmount = n.AwardedAmount
            })
            .Take(8)
            .ToListAsync(cancellationToken);

        var abcVsAwarded = projectsWithAwards.Select(p => new AbcVsAwardedItem
        {
            ProjectTitle = p.Title.Length > 25 ? p.Title[..22] + "..." : p.Title,
            ABC = p.ABC > 0 ? p.ABC : p.AwardedAmount * 1.05m,
            AwardedAmount = p.AwardedAmount
        }).ToList();

        // 10. Quarterly KPI Comparison
        var quarters = new[] { "Q1", "Q2", "Q3", "Q4" };
        var quarterlyKpis = new List<QuarterlyKpiPoint>();
        for (int q = 1; q <= 4; q++)
        {
            int startM = (q - 1) * 3 + 1;
            int endM = q * 3;
            var qPrs = prs.Count(p => p.CreatedAt.Month >= startM && p.CreatedAt.Month <= endM);
            var qPos = pos.Where(p => p.CreatedAt.Month >= startM && p.CreatedAt.Month <= endM).ToList();
            var qContracts = contracts.Count(c => c.CreatedAt.Month >= startM && c.CreatedAt.Month <= endM);

            quarterlyKpis.Add(new QuarterlyKpiPoint
            {
                Quarter = quarters[q - 1],
                PRCount = qPrs,
                POCount = qPos.Count,
                ContractCount = qContracts,
                POValue = qPos.Sum(x => x.TotalAmount)
            });
        }

        // 11. Mode Shift by Quarter
        var modeShift = new List<QuarterlyModeShiftPoint>();
        for (int q = 1; q <= 4; q++)
        {
            int startM = (q - 1) * 3 + 1;
            int endM = q * 3;
            var qRfqs = rfqs.Where(r => r.CreatedAt.Month >= startM && r.CreatedAt.Month <= endM).ToList();
            modeShift.Add(new QuarterlyModeShiftPoint
            {
                Quarter = quarters[q - 1],
                BiddingCount = qRfqs.Count(r => r.ModeName.Contains("Bidding")),
                ShoppingCount = qRfqs.Count(r => r.ModeName.Contains("Shopping") || r.ModeName.Contains("SVP")),
                DirectCount = qRfqs.Count(r => r.ModeName.Contains("Direct")),
                OtherCount = qRfqs.Count(r => !r.ModeName.Contains("Bidding") && !r.ModeName.Contains("Shopping") && !r.ModeName.Contains("Direct"))
            });
        }

        // 12. YoY Summary (Real DB calculation for Current & Prior Year Savings Rates)
        var priorPrCount = await unitOfWork.PurchaseRequestRepository.Query(p => !p.IsDeleted && p.CreatedAt.Year == priorYear).CountAsync(cancellationToken);
        var priorPOVal = await unitOfWork.PurchaseOrderRepository.Query(p => !p.IsDeleted && p.CreatedAt.Year == priorYear).SumAsync(p => p.TotalAmount, cancellationToken);
        var priorContractCount = await unitOfWork.ContractRepository.Query(c => !c.IsDeleted && c.CreatedAt.Year == priorYear).CountAsync(cancellationToken);

        var currentProjIds = noas.Select(n => n.ProcurementProjectId).Distinct().ToList();
        var currentABC = await unitOfWork.ProcurementProjectRepository.Query(p => currentProjIds.Contains(p.Id))
            .SumAsync(p => p.ABC, cancellationToken);
        var currentSavingsRate = currentABC > 0 && currentABC >= totalAwarded
            ? Math.Round((double)((currentABC - totalAwarded) / currentABC) * 100.0, 1)
            : 0.0;

        var priorNoas = await unitOfWork.NoticeOfAwardRepository.Query(n => !n.IsDeleted && n.CreatedAt.Year == priorYear)
            .Select(n => new { n.AwardedAmount, n.ProcurementProjectId })
            .ToListAsync(cancellationToken);
        var priorAwarded = priorNoas.Sum(n => n.AwardedAmount);
        var priorProjIds = priorNoas.Select(n => n.ProcurementProjectId).Distinct().ToList();
        var priorABC = await unitOfWork.ProcurementProjectRepository.Query(p => priorProjIds.Contains(p.Id))
            .SumAsync(p => p.ABC, cancellationToken);
        var priorSavingsRate = priorABC > 0 && priorABC >= priorAwarded
            ? Math.Round((double)((priorABC - priorAwarded) / priorABC) * 100.0, 1)
            : 0.0;

        var yoy = new YearOverYearSummary
        {
            CurrentYear = targetYear,
            PriorYear = priorYear,
            CurrentYearPRCount = prs.Count,
            PriorYearPRCount = priorPrCount,
            CurrentYearPOValue = pos.Sum(p => p.TotalAmount),
            PriorYearPOValue = priorPOVal,
            CurrentYearContractCount = contracts.Count,
            PriorYearContractCount = priorContractCount,
            CurrentYearSavingsRate = currentSavingsRate,
            PriorYearSavingsRate = priorSavingsRate
        };

        var analytics = new ProcurementDashboardAnalyticsDto
        {
            MonthlyPRCount = monthlyPR,
            MonthlyPOValue = monthlyPO,
            ModeDistribution = modeDist,
            TopSpendingOffices = topOffices,
            ContractStatusDist = contractStatusDist,
            TopSuppliers = topSuppliers,
            OverdueTrend = overdueTrend,
            TatBenchmark = tatBenchmark,
            AbcVsAwarded = abcVsAwarded,
            QuarterlyKpiComparison = quarterlyKpis,
            ModeShiftByQuarter = modeShift,
            PipelineTrend = pipelineTrend,
            YearOverYear = yoy
        };

        return ApiResponse<ProcurementDashboardAnalyticsDto>.Success(analytics);
    }

    private async Task<TatStageAverages> CalculateTatForYearAsync(int year, CancellationToken cancellationToken)
    {
        // 1. PR -> CPR
        var prCprDates = await unitOfWork.ConsolidatedPRItemRepository.Query(c => !c.IsDeleted && c.CreatedAt.Year == year)
            .Include(c => c.PurchaseRequest)
            .Include(c => c.ConsolidatedPR)
            .Where(c => c.PurchaseRequest != null && c.ConsolidatedPR != null)
            .Select(c => new { PrCreated = c.PurchaseRequest.CreatedAt, CprCreated = c.ConsolidatedPR.CreatedAt })
            .ToListAsync(cancellationToken);
        var prCprDiffs = prCprDates.Select(x => (x.CprCreated - x.PrCreated).TotalDays).Where(d => d >= 0).ToList();
        double prCpr = prCprDiffs.Count > 0 ? Math.Round(prCprDiffs.Average(), 1) : 0.0;

        // 2. CPR -> RFQ
        var cprRfqDates = await unitOfWork.RFQRepository.Query(r => !r.IsDeleted && r.CreatedAt.Year == year && r.ConsolidatedPRId.HasValue)
            .Include(r => r.ConsolidatedPR)
            .Where(r => r.ConsolidatedPR != null)
            .Select(r => new { CprCreated = r.ConsolidatedPR!.CreatedAt, RfqCreated = r.CreatedAt })
            .ToListAsync(cancellationToken);
        var cprRfqDiffs = cprRfqDates.Select(x => (x.RfqCreated - x.CprCreated).TotalDays).Where(d => d >= 0).ToList();
        double cprRfq = cprRfqDiffs.Count > 0 ? Math.Round(cprRfqDiffs.Average(), 1) : 0.0;

        // 3. RFQ -> AOB
        var rfqAobDates = await unitOfWork.AOBRFQMappingRepository.Query(m => !m.IsDeleted && m.CreatedAt.Year == year)
            .Include(m => m.RFQ)
            .Include(m => m.AOB)
            .Where(m => m.RFQ != null && m.AOB != null)
            .Select(m => new { RfqCreated = m.RFQ.CreatedAt, AobCreated = m.AOB.CreatedAt })
            .ToListAsync(cancellationToken);
        var rfqAobDiffs = rfqAobDates.Select(x => (x.AobCreated - x.RfqCreated).TotalDays).Where(d => d >= 0).ToList();
        double rfqAob = rfqAobDiffs.Count > 0 ? Math.Round(rfqAobDiffs.Average(), 1) : 0.0;

        // 4. AOB -> BAC Res
        var aobBacDates = await unitOfWork.AOBProcurementProjectMappingRepository.Query(m => !m.IsDeleted && m.CreatedAt.Year == year)
            .Include(m => m.AOB)
            .Include(m => m.ProcurementProject)
                .ThenInclude(p => p.BACResolutions)
            .Where(m => m.AOB != null && m.ProcurementProject != null)
            .Select(m => new {
                AobCreated = m.AOB.CreatedAt,
                BacCreated = m.ProcurementProject.BACResolutions.Where(b => !b.IsDeleted).OrderBy(b => b.CreatedAt).Select(b => (DateTime?)b.CreatedAt).FirstOrDefault()
            })
            .ToListAsync(cancellationToken);
        var aobBacDiffs = aobBacDates.Where(x => x.BacCreated.HasValue).Select(x => (x.BacCreated!.Value - x.AobCreated).TotalDays).Where(d => d >= 0).ToList();
        double aobBac = aobBacDiffs.Count > 0 ? Math.Round(aobBacDiffs.Average(), 1) : 0.0;

        // 5. BAC Res -> NOA
        var bacNoaDates = await unitOfWork.NoticeOfAwardRepository.Query(n => !n.IsDeleted && n.CreatedAt.Year == year && n.BACResolutionId != Guid.Empty)
            .Include(n => n.BACResolution)
            .Where(n => n.BACResolution != null)
            .Select(n => new { BacCreated = n.BACResolution.CreatedAt, NoaCreated = n.CreatedAt })
            .ToListAsync(cancellationToken);
        var bacNoaDiffs = bacNoaDates.Select(x => (x.NoaCreated - x.BacCreated).TotalDays).Where(d => d >= 0).ToList();
        double bacNoa = bacNoaDiffs.Count > 0 ? Math.Round(bacNoaDiffs.Average(), 1) : 0.0;

        // 6. NOA -> Contract
        var noaContractDates = await unitOfWork.ContractRepository.Query(c => !c.IsDeleted && c.CreatedAt.Year == year && c.NoticeOfAwardId != Guid.Empty)
            .Include(c => c.NoticeOfAward)
            .Where(c => c.NoticeOfAward != null)
            .Select(c => new { NoaCreated = c.NoticeOfAward.CreatedAt, ContractCreated = c.CreatedAt })
            .ToListAsync(cancellationToken);
        var noaContractDiffs = noaContractDates.Select(x => (x.ContractCreated - x.NoaCreated).TotalDays).Where(d => d >= 0).ToList();
        double noaContract = noaContractDiffs.Count > 0 ? Math.Round(noaContractDiffs.Average(), 1) : 0.0;

        // 7. Contract -> NTP
        var contractNtpDates = await unitOfWork.NoticeToProceedRepository.Query(n => !n.IsDeleted && n.CreatedAt.Year == year && n.ContractId != Guid.Empty)
            .Include(n => n.Contract)
            .Where(n => n.Contract != null)
            .Select(n => new { ContractCreated = n.Contract.CreatedAt, NtpCreated = n.CreatedAt })
            .ToListAsync(cancellationToken);
        var contractNtpDiffs = contractNtpDates.Select(x => (x.NtpCreated - x.ContractCreated).TotalDays).Where(d => d >= 0).ToList();
        double contractNtp = contractNtpDiffs.Count > 0 ? Math.Round(contractNtpDiffs.Average(), 1) : 0.0;

        return new TatStageAverages(prCpr, cprRfq, rfqAob, aobBac, bacNoa, noaContract, contractNtp);
    }

    private record TatStageAverages(double PrCpr, double CprRfq, double RfqAob, double AobBac, double BacNoa, double NoaContract, double ContractNtp);
}

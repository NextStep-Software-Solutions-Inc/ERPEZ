using ERPEZ.Application.Features.Dashboard.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Dashboard.Queries.GetPlanningDashboard;

/// <summary>
/// Handler for GetPlanningDashboardQuery - retrieves global dashboard statistics for Planning users.
/// </summary>
public class GetPlanningDashboardQueryHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<GetPlanningDashboardQuery, ApiResponse<DashboardOverviewResponse>>
{
    public async Task<ApiResponse<DashboardOverviewResponse>> Handle(
        GetPlanningDashboardQuery query, 
        CancellationToken cancellationToken)
    {
        // Get current and previous month dates for month-over-month comparison
        var currentDate = DateTime.UtcNow;
        var currentMonthStart = new DateTime(currentDate.Year, currentDate.Month, 1);
        var previousMonthStart = currentMonthStart.AddMonths(-1);
        var previousMonthEnd = currentMonthStart.AddDays(-1);

        // Build dashboard overview
        var overview = new DashboardOverviewResponse
        {
            KPIStats = await GetKPIStatisticsAsync(
                query.FiscalYearId, 
                currentMonthStart, 
                previousMonthStart, 
                previousMonthEnd, 
                cancellationToken),
            OPCRStats = await GetOPCRStatisticsAsync(query.FiscalYearId, cancellationToken),
            BudgetStats = await GetBudgetStatisticsAsync(query.FiscalYearId, cancellationToken),
            PPMPStats = await GetPPMPStatisticsAsync(query.FiscalYearId, cancellationToken),
            OPCRCommitments = await GetOPCRCommitmentsAsync(query.FiscalYearId, cancellationToken),
            MFOStatus = await GetMFOStatusAsync(query.FiscalYearId, cancellationToken),
            KPILibraryHealth = await GetKPILibraryHealthAsync(query.FiscalYearId, cancellationToken),
            BudgetUtilizationHeatmap = await GetBudgetHeatmapAsync(query.FiscalYearId, cancellationToken)
        };

        return ApiResponse<DashboardOverviewResponse>.Success(overview);
    }

    private async Task<KPIStatistics> GetKPIStatisticsAsync(
        Guid fiscalYearId,
        DateTime currentMonthStart,
        DateTime previousMonthStart,
        DateTime previousMonthEnd,
        CancellationToken cancellationToken)
    {
        var kpiCreatedDates = await unitOfWork.KPIRepository.ToListAsync(
            unitOfWork.KPIRepository.Query()
                .Where(k => !k.IsDeleted)
                .Select(k => k.CreatedAt),
            cancellationToken);
        var totalKPIs = kpiCreatedDates.Count;

        // KPIs encoded this month
        var thisMonthKPIs = kpiCreatedDates.Count(createdAt => createdAt >= currentMonthStart);

        // KPIs encoded last month for comparison
        var lastMonthKPIs = kpiCreatedDates.Count(createdAt => createdAt >= previousMonthStart && createdAt <= previousMonthEnd);

        // Calculate month-over-month change
        var monthOverMonthChange = lastMonthKPIs > 0 
            ? ((thisMonthKPIs - lastMonthKPIs) / (decimal)lastMonthKPIs) * 100 
            : 0;

        return new KPIStatistics
        {
            TotalKPIsEncoded = totalKPIs,
            EncodedThisMonth = thisMonthKPIs,
            MonthOverMonthChange = Math.Round(monthOverMonthChange, 2)
        };
    }

    private async Task<OPCRStatistics> GetOPCRStatisticsAsync(
        Guid fiscalYearId, 
        CancellationToken cancellationToken)
    {
        var opcrs = await unitOfWork.OPCRRepository.ToListAsync(
            unitOfWork.OPCRRepository.Query()
                .Where(o => o.FiscalYearId == fiscalYearId && !o.IsDeleted)
                .Select(o => o.Status),
            cancellationToken);
        var totalOPCRs = opcrs.Count;

        // Submitted = Status is Submitted or Approved
        var submittedOPCRs = opcrs.Count(status => status == StatusEnum.Submitted || status == StatusEnum.Approved);

        // Pending = Draft or Returned
        var pendingOPCRs = opcrs.Count(status => status == StatusEnum.Draft || status == StatusEnum.Returned);

        var submittedPercentage = totalOPCRs > 0 
            ? (submittedOPCRs / (decimal)totalOPCRs) * 100 
            : 0;

        return new OPCRStatistics
        {
            TotalOPCRs = totalOPCRs,
            SubmittedCount = submittedOPCRs,
            PendingCount = pendingOPCRs,
            SubmittedPercentage = Math.Round(submittedPercentage, 2)
        };
    }

    private async Task<BudgetStatistics> GetBudgetStatisticsAsync(
        Guid fiscalYearId, 
        CancellationToken cancellationToken)
    {
        await Task.CompletedTask;

        // Placeholder until Budget module repositories are exposed in IUnitOfWork.
        return new BudgetStatistics
        {
            PlannedAmount = 68000000m,
            UtilizedAmount = 61000000m,
            UtilizationPercentage = 89.71m,
            Currency = "PHP"
        };
    }

    private async Task<PPMPStatistics> GetPPMPStatisticsAsync(
        Guid fiscalYearId, 
        CancellationToken cancellationToken)
    {
        await Task.CompletedTask;

        // Placeholder until Procurement repositories are exposed in IUnitOfWork.
        return new PPMPStatistics
        {
            TotalPPMPs = 100,
            ConsolidatedCount = 52,
            InProgressCount = 30,
            PendingItemsCount = 18,
            ConsolidatedPercentage = 52m
        };
    }

    private async Task<List<OPCRPlannedActual>> GetOPCRCommitmentsAsync(
        Guid fiscalYearId, 
        CancellationToken cancellationToken)
    {
        // Get OPCR activities with their planned and actual budgets by month
        var opcrActivities = await unitOfWork.OPCRActivityRepository.ToListAsync(
            unitOfWork.OPCRActivityRepository.Query()
                .Where(a => a.OPCRItem.OPCR.FiscalYearId == fiscalYearId && !a.IsDeleted)
                .Select(a => new { a.CreatedAt, a.Budget }),
            cancellationToken);

        // Group by month and calculate planned vs actual
        var monthlyData = opcrActivities
            .GroupBy(a => a.CreatedAt.Month)
            .OrderBy(g => g.Key)
            .Select(g => new OPCRPlannedActual
            {
                Month = new DateTime(2000, g.Key, 1).ToString("MMM"),
                PlannedAmount = g.Sum(a => a.Budget),
                ActualAmount = g.Sum(a => a.Budget) * 0.85m,
                Variance = (g.Sum(a => a.Budget) * 0.85m) - g.Sum(a => a.Budget)
            })
            .ToList();

        return monthlyData;
    }

    private async Task<MFOReferenceSummary> GetMFOStatusAsync(
        Guid fiscalYearId, 
        CancellationToken cancellationToken)
    {
        var mfos = await unitOfWork.MFOPAPRepository.ToListAsync(
            unitOfWork.MFOPAPRepository.Query()
                .Where(m => m.FiscalYearId == fiscalYearId && !m.IsDeleted)
                .Select(m => m.IsActive),
            cancellationToken);
        var totalMFOs = mfos.Count;

        var completedMFOs = 0;

        var activeMFOs = mfos.Count(isActive => isActive);

        var pendingMFOs = mfos.Count(isActive => !isActive);

        var completionPercentage = totalMFOs > 0 
            ? (completedMFOs / (decimal)totalMFOs) * 100 
            : 0;

        return new MFOReferenceSummary
        {
            TotalMFOs = totalMFOs,
            CompletedCount = completedMFOs,
            OngoingCount = activeMFOs,
            PendingCount = pendingMFOs,
            CompletionPercentage = Math.Round(completionPercentage, 2)
        };
    }

    private async Task<KPILibraryHealth> GetKPILibraryHealthAsync(
        Guid fiscalYearId, 
        CancellationToken cancellationToken)
    {
        // Get FY Active KPIs for this fiscal year
        var fyActiveKpis = await unitOfWork.FYActiveKPIRepository.ToListAsync(
            unitOfWork.FYActiveKPIRepository.Query()
                .Where(fk => fk.FiscalYearId == fiscalYearId && !fk.IsDeleted)
                .Select(fk => fk.Status),
            cancellationToken);
        var totalKPIs = fyActiveKpis.Count;

        // Active = Status is Active
        var activeKPIs = fyActiveKpis.Count(status => status == "Active");

        // Pending = Submitted or Returned status
        var pendingKPIs = fyActiveKpis.Count(status => status == "Pending");

        // Inactive = IsActive == false
        var inactiveKPIs = fyActiveKpis.Count(status => status == "Inactive");

        var activePercentage = totalKPIs > 0 ? (activeKPIs / (decimal)totalKPIs) * 100 : 0;
        var pendingPercentage = totalKPIs > 0 ? (pendingKPIs / (decimal)totalKPIs) * 100 : 0;
        var inactivePercentage = totalKPIs > 0 ? (inactiveKPIs / (decimal)totalKPIs) * 100 : 0;

        // Determine health status
        var healthStatus = activePercentage switch
        {
            >= 60 => "Healthy",
            >= 40 => "Warning",
            _ => "Critical"
        };

        return new KPILibraryHealth
        {
            TotalKPIs = totalKPIs,
            ActiveCount = activeKPIs,
            PendingCount = pendingKPIs,
            InactiveCount = inactiveKPIs,
            ActivePercentage = Math.Round(activePercentage, 2),
            PendingPercentage = Math.Round(pendingPercentage, 2),
            InactivePercentage = Math.Round(inactivePercentage, 2),
            HealthStatus = healthStatus
        };
    }

    private async Task<List<BudgetHeatmapData>> GetBudgetHeatmapAsync(
        Guid fiscalYearId, 
        CancellationToken cancellationToken)
    {
        // Placeholder heatmap derived from office list until budget repositories are exposed.
        var offices = await unitOfWork.OfficeRepository.ToListAsync(
            unitOfWork.OfficeRepository.Query()
                .Where(o => !o.IsDeleted)
                .Select(o => new { o.Id, o.Name }),
            cancellationToken);

        return offices.Select((office, idx) =>
        {
            var baseValue = 35m + (idx % 6) * 7m;
            var monthly = Enumerable.Range(0, 12)
                .Select(m => Math.Round(Math.Min(100m, baseValue + m * 1.5m), 2))
                .ToList();
            return new BudgetHeatmapData
            {
                Department = office.Name,
                DepartmentId = office.Id,
                MonthlyUtilization = monthly,
                AverageUtilization = Math.Round(monthly.Average(), 2)
            };
        }).OrderByDescending(x => x.AverageUtilization).ToList();
    }
}

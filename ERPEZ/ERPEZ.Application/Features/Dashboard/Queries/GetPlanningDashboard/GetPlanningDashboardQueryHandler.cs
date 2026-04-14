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
        var currentMonthStart = new DateTime(currentDate.Year, currentDate.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var previousMonthStart = currentMonthStart.AddMonths(-1);
        var previousMonthEnd = currentMonthStart.AddDays(-1);

        // Build dashboard overview
        var overview = new DashboardOverviewResponse
        {
            KPIStats = await GetKPIStatisticsAsync(
                query.FiscalYearId, 
                query.OrganizationId,
                currentMonthStart, 
                previousMonthStart, 
                previousMonthEnd, 
                cancellationToken),
            OPCRStats = await GetOPCRStatisticsAsync(query.FiscalYearId, query.OrganizationId, cancellationToken),
            BudgetStats = await GetBudgetStatisticsAsync(query.FiscalYearId, cancellationToken),
            PPMPStats = await GetPPMPStatisticsAsync(query.FiscalYearId, cancellationToken),
            OPCRCommitments = await GetOPCRCommitmentsAsync(query.FiscalYearId, query.OrganizationId, cancellationToken),
            MFOStatus = await GetMFOStatusAsync(query.FiscalYearId, query.OrganizationId, cancellationToken),
            KPILibraryHealth = await GetKPILibraryHealthAsync(query.FiscalYearId, query.OrganizationId, cancellationToken),
            BudgetUtilizationHeatmap = await GetBudgetHeatmapAsync(query.FiscalYearId, query.OrganizationId, cancellationToken)
        };

        return ApiResponse<DashboardOverviewResponse>.Success(overview);
    }

    private async Task<KPIStatistics> GetKPIStatisticsAsync(
        Guid fiscalYearId,
        Guid? organizationId,
        DateTime currentMonthStart,
        DateTime previousMonthStart,
        DateTime previousMonthEnd,
        CancellationToken cancellationToken)
    {
        await Task.CompletedTask;

        // Execute aggregate counts at query-provider level to avoid materializing large datasets.
        var scopedOfficeIds = await GetScopedOfficeIdsAsync(organizationId, cancellationToken);

        var baseQuery = unitOfWork.FYActiveKPIRepository.Query()
            .Where(k => !k.IsDeleted && k.FiscalYearId == fiscalYearId);

        if (scopedOfficeIds != null)
        {
            baseQuery = baseQuery.Where(k => k.KPIAssignments.Any(a => scopedOfficeIds.Contains(a.OfficeId)));
        }

        var totalKPIs = baseQuery.Count();

        // KPIs encoded this month
        var thisMonthKPIs = baseQuery.Count(k => k.CreatedAt >= currentMonthStart);

        // KPIs encoded last month for comparison
        var lastMonthKPIs = baseQuery.Count(k => k.CreatedAt >= previousMonthStart && k.CreatedAt <= previousMonthEnd);

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
        Guid? organizationId,
        CancellationToken cancellationToken)
    {
        var scopedOfficeIds = await GetScopedOfficeIdsAsync(organizationId, cancellationToken);

        var opcrs = await unitOfWork.OPCRRepository.ToListAsync(
            unitOfWork.OPCRRepository.Query()
                .Where(o => o.FiscalYearId == fiscalYearId && !o.IsDeleted)
                .Where(o => scopedOfficeIds == null || scopedOfficeIds.Contains(o.OfficeId))
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
        // Use neutral values to avoid presenting fabricated financial figures as real data.
        return new BudgetStatistics
        {
            PlannedAmount = 0m,
            UtilizedAmount = 0m,
            UtilizationPercentage = 0m,
            Currency = "PHP"
        };
    }

    private async Task<PPMPStatistics> GetPPMPStatisticsAsync(
        Guid fiscalYearId, 
        CancellationToken cancellationToken)
    {
        await Task.CompletedTask;

        // Placeholder until Procurement repositories are exposed in IUnitOfWork.
        // Use neutral values to avoid presenting fabricated consolidation metrics as real data.
        return new PPMPStatistics
        {
            TotalPPMPs = 0,
            ConsolidatedCount = 0,
            InProgressCount = 0,
            PendingItemsCount = 0,
            ConsolidatedPercentage = 0m
        };
    }

    private async Task<List<OPCRPlannedActual>> GetOPCRCommitmentsAsync(
        Guid fiscalYearId, 
        Guid? organizationId,
        CancellationToken cancellationToken)
    {
        var scopedOfficeIds = await GetScopedOfficeIdsAsync(organizationId, cancellationToken);

        // Get OPCR activities with their planned and actual budgets by month
        var opcrActivities = await unitOfWork.OPCRActivityRepository.ToListAsync(
            unitOfWork.OPCRActivityRepository.Query()
                .Where(a => a.OPCRItem.OPCR.FiscalYearId == fiscalYearId && !a.IsDeleted)
                .Where(a => scopedOfficeIds == null || scopedOfficeIds.Contains(a.OPCRItem.OPCR.OfficeId))
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
                ActualAmount = 0m,
                Variance = -g.Sum(a => a.Budget)
            })
            .ToList();

        return monthlyData;
    }

    private async Task<MFOReferenceSummary> GetMFOStatusAsync(
        Guid fiscalYearId, 
        Guid? organizationId,
        CancellationToken cancellationToken)
    {
        var scopedOfficeIds = await GetScopedOfficeIdsAsync(organizationId, cancellationToken);

        var mfoIds = await unitOfWork.FYActiveKPIRepository.ToListAsync(
            unitOfWork.FYActiveKPIRepository.Query()
                .Where(k => !k.IsDeleted && k.FiscalYearId == fiscalYearId && k.MFOPAPId != null)
                .Where(k => scopedOfficeIds == null || k.KPIAssignments.Any(a => scopedOfficeIds.Contains(a.OfficeId)))
                .Select(k => k.MFOPAPId!.Value)
                .Distinct(),
            cancellationToken);

        var mfos = await unitOfWork.MFOPAPRepository.ToListAsync(
            unitOfWork.MFOPAPRepository.Query()
                .Where(m => !m.IsDeleted && mfoIds.Contains(m.Id))
                .Select(m => m.IsActive),
            cancellationToken);
        var totalMFOs = mfos.Count;

        // Completed count is intentionally zero until a completed-state source is integrated.
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
        Guid? organizationId,
        CancellationToken cancellationToken)
    {
        var scopedOfficeIds = await GetScopedOfficeIdsAsync(organizationId, cancellationToken);

        // Get FY Active KPIs for this fiscal year
        var fyActiveKpis = await unitOfWork.FYActiveKPIRepository.ToListAsync(
            unitOfWork.FYActiveKPIRepository.Query()
                .Where(fk => fk.FiscalYearId == fiscalYearId && !fk.IsDeleted)
                .Where(fk => scopedOfficeIds == null || fk.KPIAssignments.Any(a => scopedOfficeIds.Contains(a.OfficeId)))
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
        Guid? organizationId,
        CancellationToken cancellationToken)
    {
        var scopedOfficeIds = await GetScopedOfficeIdsAsync(organizationId, cancellationToken);

        // Placeholder heatmap derived from office list until budget repositories are exposed.
        var offices = await unitOfWork.OfficeRepository.ToListAsync(
            unitOfWork.OfficeRepository.Query()
                .Where(o => !o.IsDeleted)
                .Where(o => scopedOfficeIds == null || scopedOfficeIds.Contains(o.Id))
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

    private async Task<List<Guid>?> GetScopedOfficeIdsAsync(Guid? organizationId, CancellationToken cancellationToken)
    {
        if (!organizationId.HasValue)
        {
            return null;
        }

        var scopedOfficeIds = await unitOfWork.OfficeRepository.ToListAsync(
            unitOfWork.OfficeRepository.Query()
                .Where(o => !o.IsDeleted && o.OrganizationId == organizationId.Value)
                .Select(o => o.Id),
            cancellationToken);

        return scopedOfficeIds;
    }
}

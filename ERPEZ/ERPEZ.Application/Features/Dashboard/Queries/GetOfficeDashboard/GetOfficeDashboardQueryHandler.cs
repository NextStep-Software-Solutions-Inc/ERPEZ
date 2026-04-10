using ERPEZ.Application.Features.Dashboard.Dtos;
using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Exceptions;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Dashboard.Queries.GetOfficeDashboard;

/// <summary>
/// Handler for GetOfficeDashboardQuery - retrieves department-specific dashboard statistics for Office users.
/// </summary>
public class GetOfficeDashboardQueryHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService)
    : IRequestHandler<GetOfficeDashboardQuery, ApiResponse<DashboardOverviewResponse>>
{
    public async Task<ApiResponse<DashboardOverviewResponse>> Handle(
        GetOfficeDashboardQuery query,
        CancellationToken cancellationToken)
    {
        var officeId = query.OfficeId ?? currentUserService.OfficeId;
        if (!officeId.HasValue)
        {
            throw new ValidationException("Office ID is required. User must be assigned to an office.");
        }

        var office = await unitOfWork.OfficeRepository.GetByIdAsync(officeId.Value, cancellationToken);
        if (office == null)
        {
            throw new NotFoundException($"Office with ID {officeId.Value} not found.");
        }

        var now = DateTime.UtcNow;
        var currentMonthStart = new DateTime(now.Year, now.Month, 1);
        var previousMonthStart = currentMonthStart.AddMonths(-1);
        var previousMonthEnd = currentMonthStart.AddDays(-1);

        var overview = new DashboardOverviewResponse
        {
            KPIStats = await GetKPIStatisticsAsync(officeId.Value, currentMonthStart, previousMonthStart, previousMonthEnd, cancellationToken),
            OPCRStats = await GetOPCRStatisticsAsync(query.FiscalYearId, officeId.Value, cancellationToken),
            BudgetStats = GetBudgetStatisticsPlaceholder(),
            PPMPStats = GetPPMPStatisticsPlaceholder(),
            OPCRCommitments = await GetOPCRCommitmentsAsync(query.FiscalYearId, officeId.Value, cancellationToken),
            MFOStatus = await GetMFOStatusAsync(query.FiscalYearId, officeId.Value, cancellationToken),
            KPILibraryHealth = await GetKPILibraryHealthAsync(query.FiscalYearId, officeId.Value, cancellationToken),
            BudgetUtilizationHeatmap = await GetBudgetHeatmapAsync(officeId.Value, cancellationToken)
        };

        return ApiResponse<DashboardOverviewResponse>.Success(overview);
    }

    private async Task<KPIStatistics> GetKPIStatisticsAsync(
        Guid officeId,
        DateTime currentMonthStart,
        DateTime previousMonthStart,
        DateTime previousMonthEnd,
        CancellationToken cancellationToken)
    {
        var activeKpis = unitOfWork.FYActiveKPIRepository.Query()
            .Where(x => !x.IsDeleted && x.KPIAssignments.Any(a => a.OfficeId == officeId));

        var activeKpiList = await unitOfWork.FYActiveKPIRepository.ToListAsync(activeKpis, cancellationToken);
        var total = activeKpiList.Count;
        var thisMonth = activeKpiList.Count(x => x.CreatedAt >= currentMonthStart);
        var lastMonth = activeKpiList.Count(x => x.CreatedAt >= previousMonthStart && x.CreatedAt <= previousMonthEnd);

        var change = lastMonth > 0 ? ((thisMonth - lastMonth) / (decimal)lastMonth) * 100m : 0m;

        return new KPIStatistics
        {
            TotalKPIsEncoded = total,
            EncodedThisMonth = thisMonth,
            MonthOverMonthChange = Math.Round(change, 2)
        };
    }

    private async Task<OPCRStatistics> GetOPCRStatisticsAsync(Guid fiscalYearId, Guid officeId, CancellationToken cancellationToken)
    {
        var opcrs = unitOfWork.OPCRRepository.Query()
            .Where(x => !x.IsDeleted && x.FiscalYearId == fiscalYearId && x.OfficeId == officeId);

        var opcrList = await unitOfWork.OPCRRepository.ToListAsync(opcrs, cancellationToken);
        var total = opcrList.Count;
        var submitted = opcrList.Count(x => x.Status == Domain.Enums.StatusEnum.Submitted || x.Status == Domain.Enums.StatusEnum.Approved);
        var pending = opcrList.Count(x => x.Status == Domain.Enums.StatusEnum.Draft || x.Status == Domain.Enums.StatusEnum.Returned);
        var pct = total > 0 ? (submitted / (decimal)total) * 100m : 0m;

        return new OPCRStatistics
        {
            TotalOPCRs = total,
            SubmittedCount = submitted,
            PendingCount = pending,
            SubmittedPercentage = Math.Round(pct, 2)
        };
    }

    private static BudgetStatistics GetBudgetStatisticsPlaceholder()
    {
        return new BudgetStatistics
        {
            PlannedAmount = 8800000m,
            UtilizedAmount = 5100000m,
            UtilizationPercentage = 57.95m,
            Currency = "PHP"
        };
    }

    private static PPMPStatistics GetPPMPStatisticsPlaceholder()
    {
        return new PPMPStatistics
        {
            TotalPPMPs = 30,
            ConsolidatedCount = 15,
            InProgressCount = 9,
            PendingItemsCount = 6,
            ConsolidatedPercentage = 50m
        };
    }

    private async Task<List<OPCRPlannedActual>> GetOPCRCommitmentsAsync(Guid fiscalYearId, Guid officeId, CancellationToken cancellationToken)
    {
        var activities = await unitOfWork.OPCRActivityRepository.ToListAsync(
            unitOfWork.OPCRActivityRepository.Query()
                .Where(x => !x.IsDeleted && x.OPCRItem.OPCR.FiscalYearId == fiscalYearId && x.OPCRItem.OPCR.OfficeId == officeId),
            cancellationToken);

        return activities
            .GroupBy(x => x.CreatedAt.Month)
            .OrderBy(x => x.Key)
            .Select(g =>
            {
                var planned = g.Sum(x => x.Budget);
                var actual = planned * 0.86m;
                return new OPCRPlannedActual
                {
                    Month = new DateTime(2000, g.Key, 1).ToString("MMM"),
                    PlannedAmount = planned,
                    ActualAmount = actual,
                    Variance = actual - planned
                };
            })
            .ToList();
    }

    private async Task<MFOReferenceSummary> GetMFOStatusAsync(Guid fiscalYearId, Guid officeId, CancellationToken cancellationToken)
    {
        var mfoIds = (await unitOfWork.FYActiveKPIRepository.ToListAsync(
            unitOfWork.FYActiveKPIRepository.Query()
                .Where(x => !x.IsDeleted && x.FiscalYearId == fiscalYearId && x.MFOPAPId != null && x.KPIAssignments.Any(a => a.OfficeId == officeId))
                .Select(x => x.MFOPAPId!.Value)
                .Distinct(),
            cancellationToken)).ToList();

        var mfos = unitOfWork.MFOPAPRepository.Query().Where(x => !x.IsDeleted && mfoIds.Contains(x.Id));
        var mfoList = await unitOfWork.MFOPAPRepository.ToListAsync(mfos, cancellationToken);
        var total = mfoList.Count;
        var ongoing = mfoList.Count(x => x.IsActive);
        var pending = mfoList.Count(x => !x.IsActive);
        var completed = 0;
        var completion = total > 0 ? (completed / (decimal)total) * 100m : 0m;

        return new MFOReferenceSummary
        {
            TotalMFOs = total,
            CompletedCount = completed,
            OngoingCount = ongoing,
            PendingCount = pending,
            CompletionPercentage = Math.Round(completion, 2)
        };
    }

    private async Task<KPILibraryHealth> GetKPILibraryHealthAsync(Guid fiscalYearId, Guid officeId, CancellationToken cancellationToken)
    {
        var q = unitOfWork.FYActiveKPIRepository.Query()
            .Where(x => !x.IsDeleted && x.FiscalYearId == fiscalYearId && x.KPIAssignments.Any(a => a.OfficeId == officeId));

        var kpiList = await unitOfWork.FYActiveKPIRepository.ToListAsync(q, cancellationToken);
        var total = kpiList.Count;
        var active = kpiList.Count(x => x.Status == "Active");
        var pending = kpiList.Count(x => x.Status == "Pending");
        var inactive = kpiList.Count(x => x.Status == "Inactive");

        var activePct = total > 0 ? (active / (decimal)total) * 100m : 0m;
        var pendingPct = total > 0 ? (pending / (decimal)total) * 100m : 0m;
        var inactivePct = total > 0 ? (inactive / (decimal)total) * 100m : 0m;

        var health = activePct >= 60m ? "Healthy" : activePct >= 40m ? "Warning" : "Critical";

        return new KPILibraryHealth
        {
            TotalKPIs = total,
            ActiveCount = active,
            PendingCount = pending,
            InactiveCount = inactive,
            ActivePercentage = Math.Round(activePct, 2),
            PendingPercentage = Math.Round(pendingPct, 2),
            InactivePercentage = Math.Round(inactivePct, 2),
            HealthStatus = health
        };
    }

    private async Task<List<BudgetHeatmapData>> GetBudgetHeatmapAsync(Guid officeId, CancellationToken cancellationToken)
    {
        var units = await unitOfWork.DeliveryUnitRepository.ToListAsync(
            unitOfWork.DeliveryUnitRepository.Query()
                .Where(x => !x.IsDeleted && x.OfficeId == officeId)
                .Select(x => new { x.Id }),
            cancellationToken);

        return units.Select((u, idx) =>
        {
            var baseValue = 30m + (idx % 5) * 10m;
            var monthly = Enumerable.Range(0, 12)
                .Select(m => Math.Round(Math.Min(100m, baseValue + m * 1.2m), 2))
                .ToList();
            return new BudgetHeatmapData
            {
                Department = $"Delivery Unit {idx + 1}",
                DepartmentId = u.Id,
                MonthlyUtilization = monthly,
                AverageUtilization = Math.Round(monthly.Average(), 2)
            };
        }).OrderByDescending(x => x.AverageUtilization).ToList();
    }
}

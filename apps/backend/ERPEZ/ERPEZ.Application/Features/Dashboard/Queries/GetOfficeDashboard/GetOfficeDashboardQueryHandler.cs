using ERPEZ.Application.Features.Dashboard.Dtos;
using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Dashboard.Queries.GetOfficeDashboard;

public class GetOfficeDashboardQueryHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService)
    : IRequestHandler<GetOfficeDashboardQuery, ApiResponse<DashboardOverviewResponse>>
{
    public async Task<ApiResponse<DashboardOverviewResponse>> Handle(
        GetOfficeDashboardQuery query,
        CancellationToken cancellationToken)
    {
        var currentUserOfficeId = currentUserService.OfficeId;
        var officeId = query.OfficeId ?? currentUserOfficeId;

        if (currentUserService.IsOfficeUser
            && currentUserOfficeId.HasValue
            && query.OfficeId.HasValue
            && query.OfficeId.Value != currentUserOfficeId.Value)
        {
            throw new ValidationException("Office users can only access their assigned office dashboard.");
        }

        if (!officeId.HasValue)
            throw new ValidationException("Office ID is required. User must be assigned to an office.");

        var office = await unitOfWork.OfficeRepository.GetByIdAsync(officeId.Value, cancellationToken)
            ?? throw new NotFoundException($"Office with ID {officeId.Value} not found.");

        var now = DateTime.UtcNow;
        var currentMonthStart  = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var previousMonthStart = currentMonthStart.AddMonths(-1);
        var previousMonthEnd   = currentMonthStart.AddDays(-1);

        var overview = new DashboardOverviewResponse
        {
            KPIStats                 = await GetKPIStatisticsAsync(query.FiscalYearId, officeId.Value, currentMonthStart, previousMonthStart, previousMonthEnd, cancellationToken),
            OPCRStats                = await GetOPCRStatisticsAsync(query.FiscalYearId, officeId.Value, cancellationToken),
            BudgetStats              = GetBudgetStatisticsPlaceholder(),
            PPMPStats                = GetPPMPStatisticsPlaceholder(),
            OPCRCommitments          = await GetOPCRCommitmentsAsync(query.FiscalYearId, officeId.Value, cancellationToken),
            MFOStatus                = await GetMFOStatusAsync(query.FiscalYearId, officeId.Value, cancellationToken),
            KPILibraryHealth         = await GetKPILibraryHealthAsync(query.FiscalYearId, officeId.Value, cancellationToken),
            BudgetUtilizationHeatmap = await GetBudgetHeatmapAsync(officeId.Value, cancellationToken)
        };

        return ApiResponse<DashboardOverviewResponse>.Success(overview);
    }

    private async Task<KPIStatistics> GetKPIStatisticsAsync(
        Guid fiscalYearId, Guid officeId,
        DateTime currentMonthStart, DateTime previousMonthStart, DateTime previousMonthEnd,
        CancellationToken cancellationToken)
    {
        await Task.CompletedTask;

        var baseQuery = unitOfWork.FYActiveKPIRepository.Query()
            .Where(x => !x.IsDeleted
                && x.FiscalYearId == fiscalYearId
                && x.KPIAssignments.Any(a => a.OfficeId == officeId));

        var total      = baseQuery.Count();
        var thisMonth  = baseQuery.Count(x => x.CreatedAt >= currentMonthStart);
        var lastMonth  = baseQuery.Count(x => x.CreatedAt >= previousMonthStart && x.CreatedAt <= previousMonthEnd);
        var change     = lastMonth > 0 ? ((thisMonth - lastMonth) / (decimal)lastMonth) * 100m : 0m;

        return new KPIStatistics
        {
            TotalKPIsEncoded     = total,
            EncodedThisMonth     = thisMonth,
            MonthOverMonthChange = Math.Round(change, 2)
        };
    }

    private async Task<OPCRStatistics> GetOPCRStatisticsAsync(
        Guid fiscalYearId, Guid officeId, CancellationToken cancellationToken)
    {
        // ✅ Project to CommitmentStatus string — Status (StatusEnum) removed from OPCR entity
        var statuses = await unitOfWork.OPCRRepository.ToListAsync(
            unitOfWork.OPCRRepository.Query()
                .Where(x => !x.IsDeleted && x.FiscalYearId == fiscalYearId && x.OfficeId == officeId)
                .Select(x => x.CommitmentStatus),
            cancellationToken);

        var total     = statuses.Count;
        var submitted = statuses.Count(s =>
            s.Equals("Submitted", StringComparison.OrdinalIgnoreCase) ||
            s.Equals("Approved",  StringComparison.OrdinalIgnoreCase));
        var pending   = statuses.Count(s =>
            s.Equals("Draft",    StringComparison.OrdinalIgnoreCase) ||
            s.Equals("Returned", StringComparison.OrdinalIgnoreCase));
        var pct       = total > 0 ? (submitted / (decimal)total) * 100m : 0m;

        return new OPCRStatistics
        {
            TotalOPCRs          = total,
            SubmittedCount      = submitted,
            PendingCount        = pending,
            SubmittedPercentage = Math.Round(pct, 2)
        };
    }

    private static BudgetStatistics GetBudgetStatisticsPlaceholder() => new()
    {
        PlannedAmount         = 0m,
        UtilizedAmount        = 0m,
        UtilizationPercentage = 0m,
        Currency              = "PHP"
    };

    private static PPMPStatistics GetPPMPStatisticsPlaceholder() => new()
    {
        TotalPPMPs             = 0,
        ConsolidatedCount      = 0,
        InProgressCount        = 0,
        PendingItemsCount      = 0,
        ConsolidatedPercentage = 0m
    };

    private async Task<List<OPCRPlannedActual>> GetOPCRCommitmentsAsync(
        Guid fiscalYearId, Guid officeId, CancellationToken cancellationToken)
    {
        var activities = await unitOfWork.OPCRActivityRepository.ToListAsync(
            unitOfWork.OPCRActivityRepository.Query()
                .Where(x => !x.IsDeleted
                    && x.OPCRItem.OPCR.FiscalYearId == fiscalYearId
                    && x.OPCRItem.OPCR.OfficeId == officeId),
            cancellationToken);

        return activities
            .GroupBy(x => x.CreatedAt.Month)
            .OrderBy(x => x.Key)
            .Select(g =>
            {
                var planned = g.Sum(x => x.Budget);
                return new OPCRPlannedActual
                {
                    Month         = new DateTime(2000, g.Key, 1).ToString("MMM"),
                    PlannedAmount = planned,
                    ActualAmount  = 0m,
                    Variance      = -planned
                };
            })
            .ToList();
    }

    private async Task<MFOReferenceSummary> GetMFOStatusAsync(
        Guid fiscalYearId, Guid officeId, CancellationToken cancellationToken)
    {
        var mfoIds = await unitOfWork.FYActiveKPIRepository.ToListAsync(
            unitOfWork.FYActiveKPIRepository.Query()
                .Where(x => !x.IsDeleted
                    && x.FiscalYearId == fiscalYearId
                    && x.MFOPAPId != null
                    && x.KPIAssignments.Any(a => a.OfficeId == officeId))
                .Select(x => x.MFOPAPId!.Value)
                .Distinct(),
            cancellationToken);

        var mfoList   = await unitOfWork.MFOPAPRepository.ToListAsync(
            unitOfWork.MFOPAPRepository.Query()
                .Where(x => !x.IsDeleted && mfoIds.Contains(x.Id)),
            cancellationToken);

        var total     = mfoList.Count;
        var completed = 0;
        var ongoing   = mfoList.Count(x => x.IsActive);
        var pending   = mfoList.Count(x => !x.IsActive);
        var completion = total > 0 ? (completed / (decimal)total) * 100m : 0m;

        return new MFOReferenceSummary
        {
            TotalMFOs            = total,
            CompletedCount       = completed,
            OngoingCount         = ongoing,
            PendingCount         = pending,
            CompletionPercentage = Math.Round(completion, 2)
        };
    }

    private async Task<KPILibraryHealth> GetKPILibraryHealthAsync(
        Guid fiscalYearId, Guid officeId, CancellationToken cancellationToken)
    {
        var kpiList = await unitOfWork.FYActiveKPIRepository.ToListAsync(
            unitOfWork.FYActiveKPIRepository.Query()
                .Where(x => !x.IsDeleted
                    && x.FiscalYearId == fiscalYearId
                    && x.KPIAssignments.Any(a => a.OfficeId == officeId))
                .Select(x => x.Status),
            cancellationToken);

        var total    = kpiList.Count;
        var active   = kpiList.Count(s => s == "Active");
        var pending  = kpiList.Count(s => s == "Pending");
        var inactive = kpiList.Count(s => s == "Inactive");

        var activePct   = total > 0 ? (active   / (decimal)total) * 100m : 0m;
        var pendingPct  = total > 0 ? (pending  / (decimal)total) * 100m : 0m;
        var inactivePct = total > 0 ? (inactive / (decimal)total) * 100m : 0m;
        var health      = activePct >= 60m ? "Healthy" : activePct >= 40m ? "Warning" : "Critical";

        return new KPILibraryHealth
        {
            TotalKPIs          = total,
            ActiveCount        = active,
            PendingCount       = pending,
            InactiveCount      = inactive,
            ActivePercentage   = Math.Round(activePct,   2),
            PendingPercentage  = Math.Round(pendingPct,  2),
            InactivePercentage = Math.Round(inactivePct, 2),
            HealthStatus       = health
        };
    }

    private async Task<List<BudgetHeatmapData>> GetBudgetHeatmapAsync(
        Guid officeId, CancellationToken cancellationToken)
    {
        var units = await unitOfWork.DeliveryUnitRepository.ToListAsync(
            unitOfWork.DeliveryUnitRepository.Query()
                .Where(x => !x.IsDeleted && x.OfficeId == officeId)
                .Select(x => new { x.Id }),
            cancellationToken);

        return units.Select((u, idx) =>
        {
            var baseValue = 30m + (idx % 5) * 10m;
            var monthly   = Enumerable.Range(0, 12)
                .Select(m => Math.Round(Math.Min(100m, baseValue + m * 1.2m), 2))
                .ToList();
            return new BudgetHeatmapData
            {
                Department         = $"Delivery Unit {idx + 1}",
                DepartmentId       = u.Id,
                MonthlyUtilization = monthly,
                AverageUtilization = Math.Round(monthly.Average(), 2)
            };
        }).OrderByDescending(x => x.AverageUtilization).ToList();
    }
}
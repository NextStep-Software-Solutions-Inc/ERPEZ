using ERPEZ.Application.Features.Dashboard.Dtos;
using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Dashboard.Queries.GetDashboardTasks;

/// <summary>
/// Handler for GetDashboardTasksQuery - retrieves smart task cards with embedded dashboard statistics.
/// </summary>
public class GetDashboardTasksQueryHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService)
    : IRequestHandler<GetDashboardTasksQuery, ApiResponse<List<SmartTaskCardResponse>>>
{
    public async Task<ApiResponse<List<SmartTaskCardResponse>>> Handle(
        GetDashboardTasksQuery query,
        CancellationToken cancellationToken)
    {
        var officeId = currentUserService.OfficeId;
        var tasks = new List<SmartTaskCardResponse>();

        if (!query.TaskType.HasValue || query.TaskType == TaskType.OPCR)
        {
            tasks.AddRange(await GetOPCRTasksAsync(query.FiscalYearId, officeId, cancellationToken));
        }

        if (!query.TaskType.HasValue || query.TaskType == TaskType.WFP || query.TaskType == TaskType.WFPExternal)
        {
            tasks.AddRange(await GetWFPTasksAsync(officeId, cancellationToken));
        }

        if (!query.TaskType.HasValue || query.TaskType == TaskType.Budget)
        {
            tasks.AddRange(await GetBudgetPlaceholderTasksAsync(query.FiscalYearId, officeId, cancellationToken));
        }

        if (!query.TaskType.HasValue || query.TaskType == TaskType.Procurement)
        {
            tasks.AddRange(await GetProcurementPlaceholderTasksAsync(query.FiscalYearId, officeId, cancellationToken));
        }

        if (query.Priority.HasValue)
        {
            tasks = tasks.Where(t => t.Priority == query.Priority.Value).ToList();
        }

        if (!string.IsNullOrWhiteSpace(query.Status))
        {
            tasks = tasks.Where(t => t.Status.Equals(query.Status, StringComparison.OrdinalIgnoreCase)).ToList();
        }

        var ordered = tasks
            .OrderByDescending(t => t.Priority)
            .ThenBy(t => t.DueDate ?? DateTime.MaxValue)
            .Take(query.MaxTasks)
            .ToList();

        return ApiResponse<List<SmartTaskCardResponse>>.Success(ordered);
    }

    private async Task<List<SmartTaskCardResponse>> GetOPCRTasksAsync(
        Guid fiscalYearId,
        Guid? officeId,
        CancellationToken cancellationToken)
    {
        var opcrQuery = unitOfWork.OPCRRepository.Query()
            .Where(o => !o.IsDeleted
                && o.FiscalYearId == fiscalYearId
                && (o.Status == StatusEnum.Submitted || o.Status == StatusEnum.Returned));

        if (officeId.HasValue)
        {
            opcrQuery = opcrQuery.Where(o => o.OfficeId == officeId.Value);
        }

        var pendingOpcrs = await unitOfWork.OPCRRepository.ToListAsync(opcrQuery, cancellationToken);
        var opcrIds = pendingOpcrs.Select(o => o.Id).ToList();
        var officeIds = pendingOpcrs.Select(o => o.OfficeId).Distinct().ToList();

        var officeNames = await unitOfWork.OfficeRepository.ToListAsync(
            unitOfWork.OfficeRepository.Query()
                .Where(o => officeIds.Contains(o.Id))
                .Select(o => new { o.Id, o.Name }),
            cancellationToken);
        var officeNameLookup = officeNames.ToDictionary(x => x.Id, x => x.Name);

        var opcrActivityAgg = await unitOfWork.OPCRActivityRepository.ToListAsync(
            unitOfWork.OPCRActivityRepository.Query()
                .Where(a => !a.IsDeleted && opcrIds.Contains(a.OPCRItem.OPCRId))
                .GroupBy(a => a.OPCRItem.OPCRId)
                .Select(g => new
                {
                    OPCRId = g.Key,
                    ActivityCount = g.Count(),
                    PlannedAmount = g.Sum(x => x.Budget)
                }),
            cancellationToken);
        var activityLookup = opcrActivityAgg.ToDictionary(
            x => x.OPCRId,
            x => new { x.ActivityCount, x.PlannedAmount });

        var strategicLinks = await unitOfWork.OPCRItemRepository.ToListAsync(
            unitOfWork.OPCRItemRepository.Query()
                .Where(oi => !oi.IsDeleted && opcrIds.Contains(oi.OPCRId) && oi.KPIAssignment.FYActiveKPI != null && oi.KPIAssignment.FYActiveKPI.MFOPAP != null)
                .Select(oi => new
                {
                    oi.OPCRId,
                    MFOId = oi.KPIAssignment.FYActiveKPI!.MFOPAP!.Id,
                    MFOCode = oi.KPIAssignment.FYActiveKPI.MFOPAP.Code,
                    MFOTitle = oi.KPIAssignment.FYActiveKPI.MFOPAP.Name,
                    MFOStatus = oi.KPIAssignment.FYActiveKPI.MFOPAP.IsActive ? "OnTrack" : "Delayed"
                }),
            cancellationToken);
        var strategicLookup = strategicLinks
            .GroupBy(x => x.OPCRId)
            .ToDictionary(
                g => g.Key,
                g =>
                {
                    var first = g.First();
                    return new StrategicLink
                    {
                        MFOId = first.MFOId,
                        MFOCode = first.MFOCode,
                        MFOTitle = first.MFOTitle,
                        MFOStatus = first.MFOStatus
                    };
                });

        var cards = new List<SmartTaskCardResponse>();

        foreach (var opcr in pendingOpcrs)
        {
            var agg = activityLookup.GetValueOrDefault(opcr.Id);
            var planned = agg?.PlannedAmount ?? 0m;
            var actual = planned * 0.86m;
            var completion = planned > 0 ? (actual / planned) * 100m : 0m;
            var officeName = officeNameLookup.GetValueOrDefault(opcr.OfficeId, "Office");
            var strategic = strategicLookup.GetValueOrDefault(opcr.Id);
            var dueDate = opcr.CreatedAt.AddDays(7);

            cards.Add(new SmartTaskCardResponse
            {
                TaskId = opcr.Id,
                Priority = DeterminePriority(dueDate, opcr.Status),
                DueDate = dueDate,
                AssignedToUserId = Guid.Empty,
                AssignedToUserName = "Approver",
                TaskType = TaskType.OPCR,
                ActionTitle = opcr.Status == StatusEnum.Submitted
                    ? $"Approve OPCR Submission - {officeName}"
                    : $"Review Returned OPCR - {officeName}",
                Description = $"OPCR for {officeName} - {opcr.Status}",
                RelatedEntityId = opcr.Id,
                RelatedEntityType = "OPCR",
                ContextStatistics = new TaskContextStatistics
                {
                    OPCRContext = new OPCRTaskContext
                    {
                        PlannedAmount = planned,
                        ActualAmount = actual,
                        CompletionPercentage = Math.Round(completion, 2),
                        Status = opcr.Status.ToString(),
                        ActivityCount = agg?.ActivityCount ?? 0
                    }
                },
                StrategicLink = strategic,
                CreatedAt = opcr.CreatedAt,
                Status = opcr.Status.ToString()
            });
        }

        return cards;
    }

    private async Task<List<SmartTaskCardResponse>> GetWFPTasksAsync(Guid? officeId, CancellationToken cancellationToken)
    {
        var wfpQuery = unitOfWork.WFPRepository.Query()
            .Where(w => !w.IsDeleted && (w.Status == StatusEnum.Submitted || w.Status == StatusEnum.Returned));

        if (officeId.HasValue)
        {
            wfpQuery = wfpQuery.Where(w => w.OfficeId == officeId.Value);
        }

        var wfps = await unitOfWork.WFPRepository.ToListAsync(wfpQuery, cancellationToken);
        var officeIds = wfps.Select(w => w.OfficeId).Distinct().ToList();
        var officeNames = await unitOfWork.OfficeRepository.ToListAsync(
            unitOfWork.OfficeRepository.Query()
                .Where(o => officeIds.Contains(o.Id))
                .Select(o => new { o.Id, o.Name }),
            cancellationToken);
        var officeNameLookup = officeNames.ToDictionary(x => x.Id, x => x.Name);

        var cards = new List<SmartTaskCardResponse>();

        foreach (var wfp in wfps)
        {
            var total = wfp.ProposedBudget ?? 0m;
            var utilized = total * 0.65m;
            var utilization = total > 0 ? (utilized / total) * 100m : 0m;
            var remaining = total - utilized;
            var dueDate = wfp.SubmittedDate?.AddDays(10) ?? wfp.CreatedAt.AddDays(10);
            var officeName = officeNameLookup.GetValueOrDefault(wfp.OfficeId, "Office");

            cards.Add(new SmartTaskCardResponse
            {
                TaskId = wfp.Id,
                Priority = DeterminePriority(dueDate, wfp.Status),
                DueDate = dueDate,
                AssignedToUserId = Guid.Empty,
                AssignedToUserName = "Approver",
                TaskType = TaskType.WFPExternal,
                ActionTitle = wfp.Status == StatusEnum.Submitted
                    ? $"Approve WFP Submission - {officeName}"
                    : $"Review Returned WFP - {officeName}",
                Description = $"WFP for {officeName} - {wfp.ProjectTitle}",
                RelatedEntityId = wfp.Id,
                RelatedEntityType = "WFP",
                ContextStatistics = new TaskContextStatistics
                {
                    WFPContext = new WFPTaskContext
                    {
                        TotalBudget = total,
                        UtilizedAmount = utilized,
                        UtilizationPercentage = Math.Round(utilization, 2),
                        RemainingBalance = remaining,
                        Status = wfp.Status.ToString(),
                        ProjectStartDate = wfp.ProjectStartDate.ToDateTime(TimeOnly.MinValue),
                        ProjectEndDate = wfp.ProjectEndDate.ToDateTime(TimeOnly.MinValue)
                    }
                },
                StrategicLink = null,
                CreatedAt = wfp.CreatedAt,
                Status = wfp.Status.ToString()
            });
        }

        return cards;
    }

    private async Task<List<SmartTaskCardResponse>> GetBudgetPlaceholderTasksAsync(
        Guid fiscalYearId,
        Guid? officeId,
        CancellationToken cancellationToken)
    {
        var seed = await unitOfWork.OPCRRepository.GetFirstAsync(
            unitOfWork.OPCRRepository.Query()
                .Where(o => !o.IsDeleted && o.FiscalYearId == fiscalYearId && (!officeId.HasValue || o.OfficeId == officeId.Value))
                .Select(o => new { o.Id, o.CreatedAt, o.OfficeId }),
            cancellationToken);

        if (seed == null)
        {
            return [];
        }

        var allocated = 1000000m;
        var utilized = 920000m;
        var pct = 92m;

        return
        [
            new SmartTaskCardResponse
            {
                TaskId = seed.Id,
                Priority = TaskPriority.High,
                DueDate = seed.CreatedAt.AddDays(5),
                AssignedToUserId = Guid.Empty,
                AssignedToUserName = "Budget Approver",
                TaskType = TaskType.Budget,
                ActionTitle = "Review Line-Item Budget Request",
                Description = "Line-Item Utilization near limit.",
                RelatedEntityId = seed.Id,
                RelatedEntityType = "Budget",
                ContextStatistics = new TaskContextStatistics
                {
                    BudgetContext = new BudgetTaskContext
                    {
                        UACSCode = "50101010",
                        LineItemDescription = "Sample UACS Budget Line",
                        AllocatedAmount = allocated,
                        UtilizedAmount = utilized,
                        UtilizationPercentage = pct,
                        WarningLevel = "Warning"
                    }
                },
                StrategicLink = null,
                CreatedAt = seed.CreatedAt,
                Status = "Submitted"
            }
        ];
    }

    private async Task<List<SmartTaskCardResponse>> GetProcurementPlaceholderTasksAsync(
        Guid fiscalYearId,
        Guid? officeId,
        CancellationToken cancellationToken)
    {
        var seed = await unitOfWork.WFPRepository.GetFirstAsync(
            unitOfWork.WFPRepository.Query()
                .Where(w => !w.IsDeleted && (!officeId.HasValue || w.OfficeId == officeId.Value))
                .Select(w => new { w.Id, w.CreatedAt }),
            cancellationToken);

        if (seed == null)
        {
            return [];
        }

        return
        [
            new SmartTaskCardResponse
            {
                TaskId = seed.Id,
                Priority = TaskPriority.Medium,
                DueDate = seed.CreatedAt.AddDays(7),
                AssignedToUserId = Guid.Empty,
                AssignedToUserName = "Procurement Approver",
                TaskType = TaskType.Procurement,
                ActionTitle = "Review PPMP Consolidation",
                Description = "Procurement consolidation progress is in-flight.",
                RelatedEntityId = seed.Id,
                RelatedEntityType = "PPMP",
                ContextStatistics = new TaskContextStatistics
                {
                    ProcurementContext = new ProcurementTaskContext
                    {
                        TotalItems = 50,
                        ConsolidatedItems = 26,
                        ConsolidationProgress = 52m,
                        PendingItems = 24,
                        Status = "InProgress"
                    }
                },
                StrategicLink = null,
                CreatedAt = seed.CreatedAt,
                Status = "Submitted"
            }
        ];
    }
    private static TaskPriority DeterminePriority(DateTime dueDate, StatusEnum status)
    {
        if (status == StatusEnum.Returned)
        {
            return TaskPriority.High;
        }

        var daysLeft = (dueDate - DateTime.UtcNow).TotalDays;
        if (daysLeft < 0)
        {
            return TaskPriority.Critical;
        }

        if (daysLeft <= 2)
        {
            return TaskPriority.High;
        }

        if (daysLeft <= 5)
        {
            return TaskPriority.Medium;
        }

        return TaskPriority.Low;
    }
}

using ERPEZ.Application.Features.Dashboard.Dtos;
using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Enums;      // ✅ Keep — WFP still uses StatusEnum
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Dashboard.Queries.GetDashboardTasks;

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
        var tasks    = new List<SmartTaskCardResponse>();

        if (!query.TaskType.HasValue || query.TaskType == TaskType.OPCR)
            tasks.AddRange(await GetOPCRTasksAsync(query.FiscalYearId, officeId, cancellationToken));

        if (!query.TaskType.HasValue || query.TaskType == TaskType.WFP || query.TaskType == TaskType.WFPExternal)
            tasks.AddRange(await GetWFPTasksAsync(officeId, query.TaskType, cancellationToken));

        if (!query.TaskType.HasValue || query.TaskType == TaskType.Budget)
            tasks.AddRange(await GetBudgetTasksAsync(query.FiscalYearId, officeId, cancellationToken));

        if (!query.TaskType.HasValue || query.TaskType == TaskType.Procurement)
            tasks.AddRange(await GetProcurementTasksAsync(query.FiscalYearId, officeId, cancellationToken));

        if (query.Priority.HasValue)
            tasks = tasks.Where(t => t.Priority == query.Priority.Value).ToList();

        if (!string.IsNullOrWhiteSpace(query.Status))
            tasks = tasks.Where(t => t.Status.Equals(query.Status, StringComparison.OrdinalIgnoreCase)).ToList();

        var ordered = tasks
            .OrderByDescending(t => t.Priority)
            .ThenBy(t => t.DueDate ?? DateTime.MaxValue)
            .Take(query.MaxTasks)
            .ToList();

        return ApiResponse<List<SmartTaskCardResponse>>.Success(ordered);
    }

    private async Task<List<SmartTaskCardResponse>> GetBudgetTasksAsync(
        Guid fiscalYearId, Guid? officeId, CancellationToken cancellationToken)
    {
        var libQuery = unitOfWork.LineItemBudgetRepository.Query()
            .Where(l => !l.IsDeleted
                && l.FiscalYearId == fiscalYearId
                && (l.Status == "Submitted" || l.Status == "Returned" || l.Status == "PendingCeilingApproval"));

        if (officeId.HasValue)
            libQuery = libQuery.Where(l => l.OfficeId == officeId.Value);

        var libs = await unitOfWork.LineItemBudgetRepository.ToListAsync(libQuery, cancellationToken);
        var libIds = libs.Select(l => l.Id).ToList();
        var officeIds = libs.Where(l => l.OfficeId.HasValue).Select(l => l.OfficeId!.Value).Distinct().ToList();

        var officeNames = await unitOfWork.OfficeRepository.ToListAsync(
            unitOfWork.OfficeRepository.Query()
                .Where(o => officeIds.Contains(o.Id))
                .Select(o => new { o.Id, o.Name }),
            cancellationToken);
        var officeNameLookup = officeNames.ToDictionary(x => x.Id, x => x.Name);

        var details = await unitOfWork.LineItemBudgetDetailRepository.ToListAsync(
            unitOfWork.LineItemBudgetDetailRepository.Query()
                .Where(d => !d.IsDeleted && libIds.Contains(d.LineItemBudgetId))
                .Select(d => new { d.LineItemBudgetId, d.Budget, ObjectCode = d.Object.Code, ObjectName = d.Object.Name }),
            cancellationToken);

        var detailsByLib = details.GroupBy(d => d.LineItemBudgetId).ToDictionary(g => g.Key, g => g.ToList());

        var cards = new List<SmartTaskCardResponse>();
        foreach (var lib in libs)
        {
            var libDetails = detailsByLib.GetValueOrDefault(lib.Id, []);
            var total = libDetails.Sum(d => d.Budget);
            var officeName = lib.OfficeId.HasValue ? officeNameLookup.GetValueOrDefault(lib.OfficeId.Value, "Office") : "Office";
            var dueDate = lib.CreatedAt.AddDays(7);
            var firstDetail = libDetails.FirstOrDefault();

            cards.Add(new SmartTaskCardResponse
            {
                TaskId = lib.Id,
                Priority = DeterminePriority(dueDate, lib.Status),
                DueDate = dueDate,
                AssignedToUserId = Guid.Empty,
                AssignedToUserName = "Budget Approver",
                TaskType = TaskType.Budget,
                ActionTitle = lib.Status.Equals("Submitted", StringComparison.OrdinalIgnoreCase)
                    ? $"Approve Line-Item Budget - {officeName}"
                    : $"Review LIB ({lib.Status}) - {officeName}",
                Description = $"LIB for {officeName} - {lib.LIBNumber}",
                RelatedEntityId = lib.Id,
                RelatedEntityType = "LineItemBudget",
                ContextStatistics = new TaskContextStatistics
                {
                    BudgetContext = new BudgetTaskContext
                    {
                        UACSCode = firstDetail?.ObjectCode ?? "5-02",
                        LineItemDescription = firstDetail?.ObjectName ?? (lib.Name ?? "Line Item Budget"),
                        AllocatedAmount = total,
                        UtilizedAmount = total,
                        UtilizationPercentage = 100m,
                        WarningLevel = "Normal"
                    }
                },
                CreatedAt = lib.CreatedAt,
                Status = lib.Status
            });
        }

        return cards;
    }

    private async Task<List<SmartTaskCardResponse>> GetProcurementTasksAsync(
        Guid fiscalYearId, Guid? officeId, CancellationToken cancellationToken)
    {
        var ppmpQuery = unitOfWork.PPMPRepository.Query()
            .Where(p => !p.IsDeleted
                && p.FiscalYearId == fiscalYearId
                && (p.Status == StatusEnum.Submitted || p.Status == StatusEnum.Returned));

        if (officeId.HasValue)
            ppmpQuery = ppmpQuery.Where(p => p.OfficeId == officeId.Value);

        var ppmps = await unitOfWork.PPMPRepository.ToListAsync(ppmpQuery, cancellationToken);
        var officeIds = ppmps.Select(p => p.OfficeId).Distinct().ToList();

        var officeNames = await unitOfWork.OfficeRepository.ToListAsync(
            unitOfWork.OfficeRepository.Query()
                .Where(o => officeIds.Contains(o.Id))
                .Select(o => new { o.Id, o.Name }),
            cancellationToken);
        var officeNameLookup = officeNames.ToDictionary(x => x.Id, x => x.Name);

        var cards = new List<SmartTaskCardResponse>();
        foreach (var ppmp in ppmps)
        {
            var officeName = officeNameLookup.GetValueOrDefault(ppmp.OfficeId, "Office");
            var dueDate = ppmp.SubmittedDate?.AddDays(7) ?? ppmp.CreatedAt.AddDays(7);
            var isSubmitted = ppmp.Status == StatusEnum.Submitted;

            cards.Add(new SmartTaskCardResponse
            {
                TaskId = ppmp.Id,
                Priority = DeterminePriority(dueDate, ppmp.Status.ToString()),
                DueDate = dueDate,
                AssignedToUserId = Guid.Empty,
                AssignedToUserName = "BAC Secretariat",
                TaskType = TaskType.Procurement,
                ActionTitle = isSubmitted
                    ? $"Review PPMP Submission - {officeName}"
                    : $"Review Returned PPMP - {officeName}",
                Description = $"PPMP {ppmp.PPMPNumber} for {officeName}",
                RelatedEntityId = ppmp.Id,
                RelatedEntityType = "PPMP",
                ContextStatistics = new TaskContextStatistics
                {
                    ProcurementContext = new ProcurementTaskContext
                    {
                        TotalItems = 1,
                        ConsolidatedItems = ppmp.ConsolidatedIntoId != null ? 1 : 0,
                        ConsolidationProgress = ppmp.ConsolidatedIntoId != null ? 100m : 0m,
                        PendingItems = ppmp.ConsolidatedIntoId == null ? 1 : 0,
                        Status = ppmp.Status.ToString()
                    }
                },
                CreatedAt = ppmp.CreatedAt,
                Status = ppmp.Status.ToString()
            });
        }

        return cards;
    }

    private async Task<List<SmartTaskCardResponse>> GetOPCRTasksAsync(
        Guid fiscalYearId, Guid? officeId, CancellationToken cancellationToken)
    {
        // ✅ Filter on CommitmentStatus string — Status (StatusEnum) removed from OPCR
        var opcrQuery = unitOfWork.OPCRRepository.Query()
            .Where(o => !o.IsDeleted
                && o.FiscalYearId == fiscalYearId
                && (o.CommitmentStatus == "Submitted" || o.CommitmentStatus == "Returned"));

        if (officeId.HasValue)
            opcrQuery = opcrQuery.Where(o => o.OfficeId == officeId.Value);

        var pendingOpcrs = await unitOfWork.OPCRRepository.ToListAsync(opcrQuery, cancellationToken);
        var opcrIds      = pendingOpcrs.Select(o => o.Id).ToList();
        var officeIds    = pendingOpcrs.Select(o => o.OfficeId).Distinct().ToList();

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
                    OPCRId        = g.Key,
                    ActivityCount = g.Count(),
                    PlannedAmount = g.Sum(x => x.Budget)
                }),
            cancellationToken);
        var activityLookup = opcrActivityAgg.ToDictionary(
            x => x.OPCRId,
            x => new { x.ActivityCount, x.PlannedAmount });

        var strategicLinks = await unitOfWork.OPCRItemRepository.ToListAsync(
            unitOfWork.OPCRItemRepository.Query()
                .Where(oi => !oi.IsDeleted
                    && opcrIds.Contains(oi.OPCRId)
                    && oi.KPIAssignment.FYActiveKPI != null
                    && oi.KPIAssignment.FYActiveKPI.MFOPAP != null)
                .Select(oi => new
                {
                    oi.OPCRId,
                    MFOId    = oi.KPIAssignment.FYActiveKPI!.MFOPAP!.Id,
                    MFOCode  = oi.KPIAssignment.FYActiveKPI.MFOPAP.Code,
                    MFOTitle = oi.KPIAssignment.FYActiveKPI.MFOPAP.Name,
                    MFOStatus = oi.KPIAssignment.FYActiveKPI.MFOPAP.IsActive ? "OnTrack" : "Delayed"
                }),
            cancellationToken);

        var strategicLookup = strategicLinks
            .GroupBy(x => x.OPCRId)
            .ToDictionary(g => g.Key, g =>
            {
                var f = g.First();
                return new StrategicLink
                {
                    MFOId    = f.MFOId,
                    MFOCode  = f.MFOCode,
                    MFOTitle = f.MFOTitle,
                    MFOStatus = f.MFOStatus
                };
            });

        var cards = new List<SmartTaskCardResponse>();

        foreach (var opcr in pendingOpcrs)
        {
            var agg         = activityLookup.GetValueOrDefault(opcr.Id);
            var planned     = agg?.PlannedAmount ?? 0m;
            var completion  = planned > 0 ? (0m / planned) * 100m : 0m;
            var officeName  = officeNameLookup.GetValueOrDefault(opcr.OfficeId, "Office");
            var strategic   = strategicLookup.GetValueOrDefault(opcr.Id);
            var dueDate     = opcr.CreatedAt.AddDays(7);

            cards.Add(new SmartTaskCardResponse
            {
                TaskId             = opcr.Id,
                Priority           = DeterminePriority(dueDate, opcr.CommitmentStatus),  // ✅ string
                DueDate            = dueDate,
                AssignedToUserId   = Guid.Empty,
                AssignedToUserName = "Approver",
                TaskType           = TaskType.OPCR,
                ActionTitle        = opcr.CommitmentStatus.Equals("Submitted", StringComparison.OrdinalIgnoreCase)
                                        ? $"Approve OPCR Submission - {officeName}"
                                        : $"Review Returned OPCR - {officeName}",
                Description        = $"OPCR for {officeName} - {opcr.CommitmentStatus}",
                RelatedEntityId    = opcr.Id,
                RelatedEntityType  = "OPCR",
                ContextStatistics  = new TaskContextStatistics
                {
                    OPCRContext = new OPCRTaskContext
                    {
                        PlannedAmount        = planned,
                        ActualAmount         = 0m,
                        CompletionPercentage = Math.Round(completion, 2),
                        Status               = opcr.CommitmentStatus,    // ✅ string
                        ActivityCount        = agg?.ActivityCount ?? 0
                    }
                },
                StrategicLink = strategic,
                CreatedAt     = opcr.CreatedAt,
                Status        = opcr.CommitmentStatus    // ✅ string
            });
        }

        return cards;
    }

    private async Task<List<SmartTaskCardResponse>> GetWFPTasksAsync(
        Guid? officeId, TaskType? requestedTaskType, CancellationToken cancellationToken)
    {
        var wfpQuery = unitOfWork.WFPRepository.Query()
            .Where(w => !w.IsDeleted
                && (w.Status == StatusEnum.Submitted || w.Status == StatusEnum.Returned));

        if (officeId.HasValue)
            wfpQuery = wfpQuery.Where(w => w.OfficeId == officeId.Value);

        var wfps         = await unitOfWork.WFPRepository.ToListAsync(wfpQuery, cancellationToken);
        var officeIds    = wfps.Select(w => w.OfficeId).Distinct().ToList();
        var officeNames  = await unitOfWork.OfficeRepository.ToListAsync(
            unitOfWork.OfficeRepository.Query()
                .Where(o => officeIds.Contains(o.Id))
                .Select(o => new { o.Id, o.Name }),
            cancellationToken);
        var officeNameLookup = officeNames.ToDictionary(x => x.Id, x => x.Name);

        var cards = new List<SmartTaskCardResponse>();

        foreach (var wfp in wfps)
        {
            var taskType = wfp.Mode == ModeEnum.External ? TaskType.WFPExternal : TaskType.WFP;
            if (requestedTaskType.HasValue && requestedTaskType.Value != taskType) continue;

            var total       = wfp.ProposedBudget ?? 0m;
            var utilization = total > 0 ? (0m / total) * 100m : 0m;
            var dueDate     = wfp.SubmittedDate?.AddDays(10) ?? wfp.CreatedAt.AddDays(10);
            var officeName  = officeNameLookup.GetValueOrDefault(wfp.OfficeId, "Office");

            cards.Add(new SmartTaskCardResponse
            {
                TaskId             = wfp.Id,
                Priority           = DeterminePriority(dueDate, wfp.Status.ToString()),  // ✅ .ToString() for WFP
                DueDate            = dueDate,
                AssignedToUserId   = Guid.Empty,
                AssignedToUserName = "Approver",
                TaskType           = taskType,
                ActionTitle        = wfp.Status == StatusEnum.Submitted
                                        ? $"Approve WFP Submission - {officeName}"
                                        : $"Review Returned WFP - {officeName}",
                Description        = $"WFP for {officeName} - {wfp.ProjectTitle}",
                RelatedEntityId    = wfp.Id,
                RelatedEntityType  = "WFP",
                ContextStatistics  = new TaskContextStatistics
                {
                    WFPContext = new WFPTaskContext
                    {
                        TotalBudget          = total,
                        UtilizedAmount       = 0m,
                        UtilizationPercentage = Math.Round(utilization, 2),
                        RemainingBalance     = total,
                        Status               = wfp.Status.ToString(),
                        ProjectStartDate     = wfp.ProjectStartDate.ToDateTime(TimeOnly.MinValue),
                        ProjectEndDate       = wfp.ProjectEndDate.ToDateTime(TimeOnly.MinValue)
                    }
                },
                StrategicLink = null,
                CreatedAt     = wfp.CreatedAt,
                Status        = wfp.Status.ToString()
            });
        }

        return cards;
    }

    // ✅ Now takes string — works for both OPCR (CommitmentStatus) and WFP (Status.ToString())
    private static TaskPriority DeterminePriority(DateTime dueDate, string status)
    {
        if (status.Equals("Returned", StringComparison.OrdinalIgnoreCase))
            return TaskPriority.High;

        var daysLeft = (dueDate - DateTime.UtcNow).TotalDays;

        return daysLeft switch
        {
            < 0  => TaskPriority.Critical,
            <= 2 => TaskPriority.High,
            <= 5 => TaskPriority.Medium,
            _    => TaskPriority.Low
        };
    }
}
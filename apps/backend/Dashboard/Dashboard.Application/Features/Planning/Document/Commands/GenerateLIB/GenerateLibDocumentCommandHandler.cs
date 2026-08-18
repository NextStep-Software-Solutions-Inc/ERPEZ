using ERPEZ.Application.Common.Dtos;
using ERPEZ.Application.Interfaces.Services;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

using LibEntity              = ERPEZ.Domain.Entities.Planning.LineItemBudget;
using DetailEntity           = ERPEZ.Domain.Entities.Planning.LineItemBudgetDetail;
using ActivityEntity         = ERPEZ.Domain.Entities.Planning.LineItemBudgetActivity;
using GeneratedDocumentEntity = ERPEZ.Domain.Entities.Planning.GeneratedDocument;
using ERPEZ.Application.Features.Planning.Budgeting.Common.Enums;

namespace ERPEZ.Application.Features.Planning.Document.Commands.GenerateLIB;

public class GenerateLibDocumentCommandHandler(
    IUnitOfWork              unitOfWork,
    IDocumentRendererService rendererService,
    IDocumentStorageService  storageService)
    : IRequestHandler<GenerateLibDocumentCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(
        GenerateLibDocumentCommand request,
        CancellationToken          cancellationToken)
    {
        // ── 1. Fetch ─────────────────────────────────────────────────────────
        var lib = await unitOfWork.LineItemBudgetRepository
            .GetByIdWithDetailsAsync(request.LibId, cancellationToken)
            ?? throw new NotFoundException("Line Item Budget not found.");

        // ── Validate scope (LIB-specific) ────────────────────────────────
        if (string.IsNullOrWhiteSpace(lib.Scope))
            throw new InvalidOperationException(
                $"Line Item Budget '{lib.LIBNumber}' has no scope defined.");

        // ── Validate scope consistency ────────────────────────────────────
        ValidateLibScope(lib.Scope);

        // ── Resolve WFP source document if applicable ────────────────────────
        var wfp = lib.LineItemBudgetActivities
            .Select(a => a.WFPObjectiveActivity?.WFPObjective?.WFP)
            .FirstOrDefault(w => w is not null);

        if (wfp is null && lib.SourceId.HasValue && lib.SourceType.Equals("WFP", StringComparison.OrdinalIgnoreCase))
        {
            wfp = await unitOfWork.WFPRepository.GetByIdAsync(lib.SourceId.Value, cancellationToken);
        }

        // ── 2. Map ───────────────────────────────────────────────────────────
        var dataDto = MapToLibDataDto(lib, wfp);

        if (string.Equals(lib.Scope, nameof(LIBScopeEnum.Project), StringComparison.OrdinalIgnoreCase))
        {
            dataDto = dataDto with { ProjectScope = BuildProjectScope(lib, wfp) };
        }

        // ── 3. Render ────────────────────────────────────────────────────────
        var bytes = await rendererService.RenderAsync(
            dataDto, DocumentType.Lib, request.Format, cancellationToken);

        // ── 4. Persist ───────────────────────────────────────────────────────
        if (lib.OfficeId is null)
            throw new InvalidOperationException(
                $"Line Item Budget '{lib.LIBNumber}' has no associated office. Cannot persist generated document.");

        var fiscalYear = ResolveFiscalYear(lib, wfp);

        var extension  = request.Format == ExportFormat.Excel ? "xlsx" : "pdf";
        var fileName   = $"LIB_{lib.LIBNumber}_{DateTime.UtcNow:yyyyMMddHHmmss}.{extension}";
        var path       = await storageService.SaveAsync(bytes, fileName, cancellationToken);

        var record = new GeneratedDocumentEntity
        {
            DocumentType  = DocumentType.Lib,
            Format        = request.Format,
            OfficeId      = lib.OfficeId.Value,
            Scope         = lib.Scope,
            StoragePath   = path,
            FileName      = fileName,
            FileSizeBytes = bytes.Length,
            FiscalYear    = fiscalYear,
            GeneratedBy   = request.GeneratedBy,
            CreatedAt     = DateTime.UtcNow
        };

        await unitOfWork.GeneratedDocumentRepository.AddAsync(record, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(record.Id, $"LIB document (scope: {lib.Scope}) generated successfully.");
    }

    // ═════════════════════════════════════════════════════════════════════════
    // Mapping
    // ═════════════════════════════════════════════════════════════════════════

    private static LibDataDto MapToLibDataDto(LibEntity lib, Domain.Entities.Planning.WFP? wfp = null)
    {
        var allDetails = CollectAllDetails(lib);

        var standaloneDetails = allDetails
            .Where(d => d.LineItemBudgetActivityId is null)
            .ToList();

        // Section I — group by Activity → AllotmentClass → AccountGroup → [SubGroup] → Object (quarterly)
        var apiGroups = lib.LineItemBudgetActivities
            .Select(activity =>
            {
                var context       = ResolveActivityContext(activity);
                var expGroups = BuildExpenseGroupsQuarterly(activity.LineItemBudgetDetails);
                return new LibApiGroupDto
                {
                    ActivityName    = activity.Name,
                    PrexcDynamicKra = context.PrexcDynamicKra,
                    GoalsOutcome    = context.GoalsOutcome,
                    ApiLabel        = context.ApiLabel,
                    ExpenseGroups   = expGroups,
                    SubTotal        = expGroups.Sum(eg => eg.SubTotal)
                };
            })
            .ToList();

        if (standaloneDetails.Count > 0)
        {
            var standaloneGroups = BuildExpenseGroupsQuarterly(standaloneDetails);
            apiGroups.Add(new LibApiGroupDto
            {
                ActivityName    = "General",
                PrexcDynamicKra = string.Empty,
                GoalsOutcome    = string.Empty,
                ApiLabel        = "General",
                ExpenseGroups   = standaloneGroups,
                SubTotal        = standaloneGroups.Sum(eg => eg.SubTotal)
            });
        }

        var monthlyExpenseGroups  = BuildExpenseGroupsMonthly(allDetails);
        var accountGroupSummaries = BuildAccountGroupSummaries(allDetails);
        var quarterSummaries      = BuildQuarterSummaries(accountGroupSummaries);
        var targetGroups          = BuildTargetGroups(lib, standaloneDetails);

        var totalBudget = lib.TotalAmount;

        var fundSourceAccountGroups = accountGroupSummaries
            .SelectMany(summary => summary.Rows.Select(row => new LibFundSourceAccountGroupDto
            {
                AllotmentClass   = summary.ExpenseClassType,
                AccountGroupName = row.AccountGroupName,
                Amount           = row.TotalBudget
            }))
            .OrderBy(g => g.AllotmentClass)
            .ThenBy(g => g.AccountGroupName)
            .ToList();

        var fundSourceSummary = new LibFundSourceSummaryDto
        {
            FundSource    = lib.FundSource?.Name ?? string.Empty,
            AccountGroups = fundSourceAccountGroups,
            Q1Budget      = allDetails.Sum(d => GetQuarterBudget(d, 1)),
            Q2Budget      = allDetails.Sum(d => GetQuarterBudget(d, 2)),
            Q3Budget      = allDetails.Sum(d => GetQuarterBudget(d, 3)),
            Q4Budget      = allDetails.Sum(d => GetQuarterBudget(d, 4)),
            TotalBudget   = totalBudget
        };

        var fiscalYearString = ResolveFiscalYear(lib, wfp, allDetails);

        return new LibDataDto
        {
            LIBNumber             = lib.LIBNumber,
            OfficeName            = BuildAgencyName(lib),
            FiscalYear            = fiscalYearString,
            FundSource            = lib.FundSource?.Name ?? string.Empty,
            Scope                 = lib.Scope,
            SourceType            = lib.SourceType,
            TotalBudget           = totalBudget,
            EffectiveDate         = lib.ApprovedDate,
            ApiGroups             = apiGroups,
            MonthlyExpenseGroups  = monthlyExpenseGroups,
            TargetGroups          = targetGroups,
            AccountGroupSummaries = accountGroupSummaries,
            QuarterSummaries      = quarterSummaries,
            FundSourceSummary     = fundSourceSummary,
            Signatories           = []
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Fiscal Year Resolution
    // ─────────────────────────────────────────────────────────────────────────

    /// <summary>
    /// Resolves the fiscal year string for a Line Item Budget document.
    /// Prefers the configured FiscalYearEntity, falls back to the WFP project date range,
    /// or derives the year range from budget detail start/end dates.
    /// </summary>
    private static string ResolveFiscalYear(
        LibEntity                     lib,
        Domain.Entities.Planning.WFP? wfp     = null,
        IEnumerable<DetailEntity>?    details = null)
    {
        var fiscalYear = lib.FiscalYearEntity?.Year.ToString();
        if (!string.IsNullOrEmpty(fiscalYear))
            return fiscalYear;

        if (wfp is not null)
        {
            return wfp.ProjectStartDate.Year == wfp.ProjectEndDate.Year
                ? wfp.ProjectStartDate.Year.ToString()
                : $"{wfp.ProjectStartDate.Year}-{wfp.ProjectEndDate.Year}";
        }

        var detailList = details?.ToList() ?? CollectAllDetails(lib);
        var minYear    = detailList.Where(d => d.StartDate.HasValue).Min(d => (int?)d.StartDate!.Value.Year);
        var maxYear    = detailList.Where(d => d.EndDate.HasValue).Max(d => (int?)d.EndDate!.Value.Year);

        return minYear.HasValue && maxYear.HasValue
            ? (minYear == maxYear ? minYear.Value.ToString() : $"{minYear}-{maxYear}")
            : DateTime.UtcNow.Year.ToString();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Detail collection
    // ─────────────────────────────────────────────────────────────────────────

    private static List<DetailEntity> CollectAllDetails(LibEntity lib)
    {
        var details = lib.LineItemBudgetActivities
            .SelectMany(a => a.LineItemBudgetDetails)
            .Concat(lib.LineItemBudgetDetails.Where(d => d.LineItemBudgetActivityId is null))
            .DistinctBy(d => d.Id)
            .ToList();

        if (details.Count == 0)
            details = lib.LineItemBudgetDetails.DistinctBy(d => d.Id).ToList();

        return details;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Section II (target groups — monthly)
    // ─────────────────────────────────────────────────────────────────────────

    private static List<LibTargetGroupDto> BuildTargetGroups(
        LibEntity                 lib,
        IEnumerable<DetailEntity> standaloneDetails)
    {
        var targetGroups = lib.LineItemBudgetActivities
            .Select(activity =>
            {
                var context       = ResolveActivityContext(activity);
                var expenseGroups = BuildExpenseGroupsMonthly(activity.LineItemBudgetDetails);
                return new LibTargetGroupDto
                {
                    ActivityName    = activity.Name,
                    PrexcDynamicKra = context.PrexcDynamicKra,
                    GoalsOutcome    = context.GoalsOutcome,
                    KpiLabel        = context.KpiLabel,
                    Targets         = ResolveTargets(activity),
                    ExpenseGroups   = expenseGroups,
                    SubTotal        = expenseGroups.Sum(g => g.SubTotal)
                };
            })
            .ToList();

        var standaloneList = standaloneDetails.ToList();
        if (standaloneList.Count > 0)
        {
            var expenseGroups = BuildExpenseGroupsMonthly(standaloneList);
            targetGroups.Add(new LibTargetGroupDto
            {
                ActivityName    = "General",
                PrexcDynamicKra = string.Empty,
                GoalsOutcome    = string.Empty,
                KpiLabel        = string.Empty,
                Targets         = [],
                ExpenseGroups   = expenseGroups,
                SubTotal        = expenseGroups.Sum(g => g.SubTotal)
            });
        }

        return targetGroups;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Expense group builders  (both return List<LibAllotmentGroupDto>)
    // ─────────────────────────────────────────────────────────────────────────

    private static List<LibAllotmentGroupDto> BuildExpenseGroupsQuarterly(
        IEnumerable<DetailEntity> details)
    {
        return details
            .Select(d => (Detail: d, Hier: ResolveHierarchy(d)))
            .GroupBy(x => x.Hier.AllotmentClass)
            .Select(allotmentGrp => new LibAllotmentGroupDto
            {
                AllotmentClass = allotmentGrp.Key,
                AccountGroups  = allotmentGrp
                    .GroupBy(x => x.Hier.AccountGroup)
                    .Select(acctGrp => new LibAccountGroupDto
                    {
                        AccountGroupName = acctGrp.Key,
                        SubGroups        = acctGrp
                            .GroupBy(x => x.Hier.SubAccountGroup)
                            .Select(subGrp => new LibSubAccountGroupDto
                            {
                                SubGroupName = subGrp.Key,
                                Rows         = subGrp
                                    .GroupBy(x => new { x.Hier.UACSCode, x.Hier.ObjectName })
                                    .Select(objGrp => new LibRowDto
                                    {
                                        UACSCode    = objGrp.Key.UACSCode,
                                        ObjectName  = objGrp.Key.ObjectName,
                                        Description = objGrp.First().Detail.Description,
                                        Q1Budget    = objGrp.Sum(x => GetQuarterBudget(x.Detail, 1)),
                                        Q2Budget    = objGrp.Sum(x => GetQuarterBudget(x.Detail, 2)),
                                        Q3Budget    = objGrp.Sum(x => GetQuarterBudget(x.Detail, 3)),
                                        Q4Budget    = objGrp.Sum(x => GetQuarterBudget(x.Detail, 4)),
                                        TotalBudget = objGrp.Sum(x => x.Detail.Budget)
                                    })
                                    .ToList(),
                                SubTotal = subGrp.Sum(x => x.Detail.Budget)
                            })
                            .ToList(),
                        SubTotal = acctGrp.Sum(x => x.Detail.Budget)
                    })
                    .ToList(),
                SubTotal = allotmentGrp.Sum(x => x.Detail.Budget)
            })
            .ToList();
    }

    private static List<LibAllotmentGroupDto> BuildExpenseGroupsMonthly(
        IEnumerable<DetailEntity> details)
    {
        return details
            .Select(d => (Detail: d, Hier: ResolveHierarchy(d)))
            .GroupBy(x => x.Hier.AllotmentClass)
            .Select(allotmentGrp => new LibAllotmentGroupDto
            {
                AllotmentClass = allotmentGrp.Key,
                AccountGroups  = allotmentGrp
                    .GroupBy(x => x.Hier.AccountGroup)
                    .Select(acctGrp => new LibAccountGroupDto
                    {
                        AccountGroupName = acctGrp.Key,
                        SubGroups        = acctGrp
                            .GroupBy(x => x.Hier.SubAccountGroup)
                            .Select(subGrp => new LibSubAccountGroupDto
                            {
                                SubGroupName = subGrp.Key,
                                Rows         = subGrp
                                    .GroupBy(x => new { x.Hier.UACSCode, x.Hier.ObjectName })
                                    .Select(objGrp => new LibRowDto
                                    {
                                        UACSCode    = objGrp.Key.UACSCode,
                                        ObjectName  = objGrp.Key.ObjectName,
                                        JanBudget   = objGrp.Sum(x => GetMonthBudget(x.Detail,  1)),
                                        FebBudget   = objGrp.Sum(x => GetMonthBudget(x.Detail,  2)),
                                        MarBudget   = objGrp.Sum(x => GetMonthBudget(x.Detail,  3)),
                                        AprBudget   = objGrp.Sum(x => GetMonthBudget(x.Detail,  4)),
                                        MayBudget   = objGrp.Sum(x => GetMonthBudget(x.Detail,  5)),
                                        JunBudget   = objGrp.Sum(x => GetMonthBudget(x.Detail,  6)),
                                        JulBudget   = objGrp.Sum(x => GetMonthBudget(x.Detail,  7)),
                                        AugBudget   = objGrp.Sum(x => GetMonthBudget(x.Detail,  8)),
                                        SepBudget   = objGrp.Sum(x => GetMonthBudget(x.Detail,  9)),
                                        OctBudget   = objGrp.Sum(x => GetMonthBudget(x.Detail, 10)),
                                        NovBudget   = objGrp.Sum(x => GetMonthBudget(x.Detail, 11)),
                                        DecBudget   = objGrp.Sum(x => GetMonthBudget(x.Detail, 12)),
                                        TotalBudget = objGrp.Sum(x => x.Detail.Budget)
                                    })
                                    .ToList(),
                                SubTotal = subGrp.Sum(x => x.Detail.Budget)
                            })
                            .ToList(),
                        SubTotal = acctGrp.Sum(x => x.Detail.Budget)
                    })
                    .ToList(),
                SubTotal = allotmentGrp.Sum(x => x.Detail.Budget)
            })
            .ToList();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Section III — account group summaries (uses hierarchy, not ExpenseClass)
    // ─────────────────────────────────────────────────────────────────────────

    private static List<LibAccountGroupSummaryDto> BuildAccountGroupSummaries(
        ICollection<DetailEntity> details)
    {
        return details
            .Select(d => (Detail: d, Hier: ResolveHierarchy(d)))
            .GroupBy(x => x.Hier.AllotmentClass)
            .Select(allotmentGrp =>
            {
                var rows = allotmentGrp
                    .GroupBy(x => x.Hier.AccountGroup)
                    .Select(acctGrp => new LibAccountGroupRowDto
                    {
                        AccountGroupName = acctGrp.Key,
                        Q1Budget         = acctGrp.Sum(x => GetQuarterBudget(x.Detail, 1)),
                        Q2Budget         = acctGrp.Sum(x => GetQuarterBudget(x.Detail, 2)),
                        Q3Budget         = acctGrp.Sum(x => GetQuarterBudget(x.Detail, 3)),
                        Q4Budget         = acctGrp.Sum(x => GetQuarterBudget(x.Detail, 4)),
                        TotalBudget      = acctGrp.Sum(x => x.Detail.Budget)
                    })
                    .OrderBy(r => r.AccountGroupName)
                    .ToList();

                return new LibAccountGroupSummaryDto
                {
                    ExpenseClassType = allotmentGrp.Key,
                    ExpenseClassName = allotmentGrp.Key,
                    Rows             = rows,
                    Q1Budget         = rows.Sum(r => r.Q1Budget),
                    Q2Budget         = rows.Sum(r => r.Q2Budget),
                    Q3Budget         = rows.Sum(r => r.Q3Budget),
                    Q4Budget         = rows.Sum(r => r.Q4Budget),
                    TotalBudget      = rows.Sum(r => r.TotalBudget)
                };
            })
            .OrderBy(s => s.ExpenseClassType)
            .ToList();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Section IV — quarter summaries (derived from Section III)
    // ─────────────────────────────────────────────────────────────────────────

    private static List<LibQuarterSummaryDto> BuildQuarterSummaries(
        IEnumerable<LibAccountGroupSummaryDto> accountGroupSummaries)
    {
        return accountGroupSummaries
            .GroupBy(s => s.ExpenseClassType)
            .Select(g => new LibQuarterSummaryDto
            {
                AllotmentClass = g.Key,
                Q1Budget       = g.Sum(s => s.Q1Budget),
                Q2Budget       = g.Sum(s => s.Q2Budget),
                Q3Budget       = g.Sum(s => s.Q3Budget),
                Q4Budget       = g.Sum(s => s.Q4Budget),
                TotalBudget    = g.Sum(s => s.TotalBudget)
            })
            .OrderBy(s => s.AllotmentClass)
            .ToList();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Activity context helpers
    // ─────────────────────────────────────────────────────────────────────────

    private static (string PrexcDynamicKra, string GoalsOutcome, string ApiLabel, string KpiLabel)
        ResolveActivityContext(ActivityEntity activity)
    {
        var opcrItem     = activity.OPCRActivity?.OPCRItem;
        var fyActiveKpi  = opcrItem?.KPIAssignment?.FYActiveKPI;
        var wfpObjective = activity.WFPObjectiveActivity?.WFPObjective;

        var prexcDynamicKra =
            fyActiveKpi?.MFOPAP?.Name
            ?? fyActiveKpi?.Name
            ?? wfpObjective?.Description
            ?? activity.Name;

        var goalsOutcome =
            activity.OPCRActivity?.Description
            ?? wfpObjective?.Outcome
            ?? string.Empty;

        var kpiLabel =
            fyActiveKpi?.Name
            ?? activity.WFPObjectiveActivity?.Indicator
            ?? activity.Name;

        return (
            PrexcDynamicKra: prexcDynamicKra,
            GoalsOutcome:    goalsOutcome,
            ApiLabel:        activity.Name,
            KpiLabel:        kpiLabel
        );
    }

    private static List<string> ResolveTargets(ActivityEntity activity)
    {
        var targets = new List<string>();

        if (!string.IsNullOrWhiteSpace(activity.OPCRActivity?.Name))
            targets.Add(activity.OPCRActivity.Name);

        if (!string.IsNullOrWhiteSpace(activity.WFPObjectiveActivity?.Indicator))
            targets.Add(activity.WFPObjectiveActivity.Indicator);

        if (!string.IsNullOrWhiteSpace(activity.WFPObjectiveActivity?.ActivityName))
            targets.Add(activity.WFPObjectiveActivity.ActivityName);

        return targets.Distinct(StringComparer.OrdinalIgnoreCase).ToList();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Object hierarchy resolution
    // ─────────────────────────────────────────────────────────────────────────

    private record ObjectHierarchy(
        string  AllotmentClass,    // root         e.g. "MOOE"
        string  AccountGroup,      // root+1       e.g. "Communication Expenses"
        string? SubAccountGroup,   // root+2       e.g. "Office Supplies Expenses" (null if absent)
        string  ObjectName,        // leaf         e.g. "Postage and Courier Expenses"
        string  UACSCode);         // leaf code    e.g. "5 02 05 010"

    private static ObjectHierarchy ResolveHierarchy(DetailEntity detail)
    {
        var chain = new List<(string Name, string Code)>();
        var node  = detail.Object;

        while (node is not null)
        {
            chain.Add((node.Name, node.Code));
            node = node.ParentObject;
        }

        chain.Reverse();

        // If the top node is the root 'Expenses' classification, remove it so chain[0] is PS/MOOE/CO
        if (chain.Count > 1 && (
            chain[0].Name.Equals("Expenses", StringComparison.OrdinalIgnoreCase) ||
            chain[0].Code.StartsWith("50000000") ||
            chain[0].Code.Equals("CLS:Expenses", StringComparison.OrdinalIgnoreCase)))
        {
            chain.RemoveAt(0);
        }

        var uacsCode = BuildUacsCode(detail);   // ← replaces leafCode

        return chain.Count switch
        {
            1 => new ObjectHierarchy(
                    AllotmentClass:  chain[0].Name,
                    AccountGroup:    chain[0].Name,
                    SubAccountGroup: null,
                    ObjectName:      chain[0].Name,
                    UACSCode:        uacsCode),

            2 => new ObjectHierarchy(
                    AllotmentClass:  chain[0].Name,
                    AccountGroup:    chain[1].Name,
                    SubAccountGroup: null,
                    ObjectName:      chain[1].Name,
                    UACSCode:        uacsCode),

            3 => new ObjectHierarchy(
                    AllotmentClass:  chain[0].Name,
                    AccountGroup:    chain[1].Name,
                    SubAccountGroup: null,
                    ObjectName:      chain[2].Name,
                    UACSCode:        uacsCode),

            _ => new ObjectHierarchy(
                    AllotmentClass:  chain[0].Name,
                    AccountGroup:    chain[1].Name,
                    SubAccountGroup: chain[2].Name,
                    ObjectName:      chain[^1].Name,
                    UACSCode:        uacsCode),
        };
    }


    // ─────────────────────────────────────────────────────────────────────────
    // Budget distribution helpers
    // ─────────────────────────────────────────────────────────────────────────

    /// <summary>
    /// Converts a DateTime (UTC or client-offset) to the canonical Philippine calendar date (UTC+8).
    /// Prevents dates like 2026-12-31T16:00:00Z from falling into the previous year or quarter.
    /// </summary>
    private static DateOnly ToPhilippineDate(DateTime dateTime)
    {
        var adjusted = dateTime.Kind == DateTimeKind.Utc || dateTime.Hour >= 12
            ? dateTime.AddHours(8)
            : dateTime;

        return DateOnly.FromDateTime(adjusted);
    }

    private static decimal GetQuarterBudget(DetailEntity detail, int quarter)
    {
        if (detail.StartDate is null)
        {
            if (string.Equals(detail.TimelineType, "Quarterly", StringComparison.OrdinalIgnoreCase))
                return detail.Budget / 4m;

            if (string.Equals(detail.TimelineType, "Monthly", StringComparison.OrdinalIgnoreCase))
                return detail.Budget / 4m;

            return quarter == 1 ? detail.Budget : 0m;
        }

        var calDate = ToPhilippineDate(detail.StartDate.Value);
        var detailQuarter = (calDate.Month - 1) / 3 + 1;
        return detailQuarter == quarter ? detail.Budget : 0m;
    }

    private static decimal GetMonthBudget(DetailEntity detail, int month)
    {
        if (detail.StartDate is null)
        {
            if (string.Equals(detail.TimelineType, "Quarterly", StringComparison.OrdinalIgnoreCase))
                return month is 1 or 4 or 7 or 10 ? detail.Budget / 4m : 0m;

            if (string.Equals(detail.TimelineType, "Monthly", StringComparison.OrdinalIgnoreCase))
                return detail.Budget / 12m;

            return month == 1 ? detail.Budget : 0m;
        }

        var calDate = ToPhilippineDate(detail.StartDate.Value);
        return calDate.Month == month ? detail.Budget : 0m;
    }

    // ─────────────────────────────────────────────────────────────────────
    // Scope validation
    // ─────────────────────────────────────────────────────────────────────

    private static void ValidateLibScope(string scope)
    {
        var validScopes = Enum.GetNames(typeof(LIBScopeEnum));
        if (!validScopes.Contains(scope, StringComparer.OrdinalIgnoreCase))
            throw new InvalidOperationException(
                $"Unknown LIB scope '{scope}'. Valid scopes: {string.Join(", ", validScopes)}");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Misc helpers
    // ─────────────────────────────────────────────────────────────────────────

    private static string BuildAgencyName(LibEntity lib)
    {
        var parts = new[]
        {
            lib.Office?.Name,
            lib.Office?.Cluster?.Name,
            lib.Office?.Organization?.Name
        };

        return string.Join(", ", parts.Where(p => !string.IsNullOrWhiteSpace(p)));
    }

    /// <summary>
    /// Concatenates Object codes from root → leaf, separated by spaces.
    /// e.g. "5" + "02" + "05" + "010" → "5 02 05 010"
    /// </summary>
    private static string BuildUacsCode(DetailEntity detail)
    {
        if (detail.Object is null) return string.Empty;

        var codes = new List<string>();
        var node  = detail.Object;
        while (node is not null)
        {
            if (!string.IsNullOrWhiteSpace(node.Code))
                codes.Add(node.Code);
            node = node.ParentObject;
        }
        codes.Reverse();
        return string.Join(" ", codes);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Project scope (WFP-sourced, dynamic cross-year quarterly columns)
    // ─────────────────────────────────────────────────────────────────────────

    private static LibProjectScopeDto BuildProjectScope(LibEntity lib, Domain.Entities.Planning.WFP? wfp = null)
    {
        wfp ??= lib.LineItemBudgetActivities
            .Select(a => a.WFPObjectiveActivity?.WFPObjective?.WFP)
            .FirstOrDefault(w => w is not null);

        var allDetails = CollectAllDetails(lib);

        // ── Columns: derived from the ACTUAL detail date range, not the WFP timeline ──
        // (WFP timeline may represent only a target window; budget execution can extend beyond it.)
        var datedDetails = allDetails.Where(d => d.StartDate is not null).ToList();

        if (datedDetails.Count == 0)
            throw new InvalidOperationException(
                $"Line Item Budget '{lib.LIBNumber}' is Project scope but no budget details have a StartDate. Cannot build quarter columns.");

        var minDate = datedDetails.Min(d => ToPhilippineDate(d.StartDate!.Value));
        var maxDate = datedDetails.Max(d => ToPhilippineDate(d.EndDate ?? d.StartDate!.Value));

        var columns = new List<LibProjectQuarterColumnDto>();
        var cursor  = new DateOnly(minDate.Year, ((minDate.Month - 1) / 3) * 3 + 1, 1);
        var labels  = new[] { "1st Quarter", "2nd Quarter", "3rd Quarter", "4th Quarter" };

        while (cursor <= maxDate)
        {
            var quarterNumber = (cursor.Month - 1) / 3 + 1;
            columns.Add(new LibProjectQuarterColumnDto
            {
                Year          = cursor.Year,
                QuarterNumber = quarterNumber,
                Label         = labels[quarterNumber - 1]
            });
            cursor = cursor.AddMonths(3);
        }

        // ── Allotment groups: group logical expenditures (combining multiple quarter allocations) ──
        var allotmentGroups = allDetails
            .Select(d => (Detail: d, Hier: ResolveHierarchy(d)))
            .GroupBy(x => x.Hier.AllotmentClass)
            .OrderBy(g => GetAllotmentClassSortOrder(g.Key))
            .Select(allotmentGrp => new LibAllotmentGroupDto
            {
                AllotmentClass = allotmentGrp.Key,
                AccountGroups  = allotmentGrp
                    .GroupBy(x => x.Hier.AccountGroup)
                    .Select(acctGrp => new LibAccountGroupDto
                    {
                        AccountGroupName = acctGrp.Key,
                        SubGroups        = acctGrp
                            .GroupBy(x => x.Hier.SubAccountGroup)
                            .Select(subGrp => new LibSubAccountGroupDto
                            {
                                SubGroupName = subGrp.Key,
                                Rows = subGrp
                                    .GroupBy(x => x.Detail.WFPObjectiveActivityExpenditureId.HasValue
                                        ? $"wfp-{x.Detail.WFPObjectiveActivityExpenditureId}"
                                        : (string.IsNullOrWhiteSpace(x.Detail.Description)
                                            ? $"{x.Detail.ObjectId}"
                                            : $"{x.Detail.ObjectId}-{x.Detail.Description.Trim()}"))
                                    .Select(descGrp => new LibRowDto
                                    {
                                        UACSCode       = descGrp.First().Hier.UACSCode,
                                        ObjectName     = descGrp.First().Hier.ObjectName,
                                        Description    = descGrp.First().Detail.Description ?? descGrp.First().Hier.ObjectName,
                                        QuarterAmounts = DistributeAcrossColumns(descGrp.Select(x => x.Detail), columns),
                                        TotalBudget    = descGrp.Sum(x => x.Detail.Budget)
                                    })
                                    .ToList(),
                                SubTotal = subGrp.Sum(x => x.Detail.Budget)
                            })
                            .ToList(),
                        SubTotal = acctGrp.Sum(x => x.Detail.Budget)
                    })
                    .ToList(),
                SubTotal = allotmentGrp.Sum(x => x.Detail.Budget)
            })
            .ToList();

        var duration = $"{minDate:MMMM d, yyyy} – {maxDate:MMMM d, yyyy}";

        return new LibProjectScopeDto
        {
            ProjectTitle     = wfp?.ProjectTitle ?? lib.Name ?? string.Empty,
            ProjectOwner     = lib.Office?.Name ?? string.Empty, // placeholder until WFP.ProjectOwner exists
            ProjectAmount    = wfp?.ProposedBudget ?? lib.TotalAmount,
            Duration         = duration,
            ProjectStartDate = wfp?.ProjectStartDate ?? minDate,
            ProjectEndDate   = wfp?.ProjectEndDate ?? maxDate,
            Columns          = columns,
            AllotmentGroups  = allotmentGroups
        };
    }

    private static int GetAllotmentClassSortOrder(string allotmentClass) =>
        allotmentClass switch
        {
            var n when n.Contains("Personnel", StringComparison.OrdinalIgnoreCase) => 0,
            var n when n.Contains("Maintenance", StringComparison.OrdinalIgnoreCase) => 1,
            var n when n.Contains("Capital Outlay", StringComparison.OrdinalIgnoreCase) => 2,
            _ => 99
        };
    /// <summary>
    /// Distributes each detail's budget across the matching quarter column(s).
    /// A detail lands fully in the column whose [Year, Quarter] matches its StartDate,
    /// or — if StartDate is null and TimelineType is Quarterly/Annual — is split evenly
    /// across all columns spanning its activity's timeline window.
    /// </summary>
    private static List<decimal> DistributeAcrossColumns(
        IEnumerable<DetailEntity> details,
        List<LibProjectQuarterColumnDto> columns)
    {
        var amounts = new decimal[columns.Count];

        foreach (var detail in details)
        {
            if (detail.StartDate is not null)
            {
                var calDate       = ToPhilippineDate(detail.StartDate.Value);
                var detailYear    = calDate.Year;
                var detailQuarter = (calDate.Month - 1) / 3 + 1;

                var idx = columns.FindIndex(c => c.Year == detailYear && c.QuarterNumber == detailQuarter);
                if (idx >= 0)
                {
                    amounts[idx] += detail.Budget;
                    continue;
                }
            }

            // Fallback: no resolvable single quarter — spread evenly across all columns.
            var share = detail.Budget / columns.Count;
            for (var i = 0; i < columns.Count; i++)
                amounts[i] += share;
        }

        return amounts.ToList();
    }
}

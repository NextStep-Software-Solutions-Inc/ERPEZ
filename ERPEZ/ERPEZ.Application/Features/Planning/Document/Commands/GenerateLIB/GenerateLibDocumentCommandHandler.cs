using ERPEZ.Application.Common.Dtos;
using ERPEZ.Application.Interfaces.Services;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

using LibEntity    = ERPEZ.Domain.Entities.Planning.LineItemBudget;
using DetailEntity = ERPEZ.Domain.Entities.Planning.LineItemBudgetDetail;
using ActivityEntity = ERPEZ.Domain.Entities.Planning.LineItemBudgetActivity;
using GeneratedDocumentEntity = ERPEZ.Domain.Entities.Planning.GeneratedDocument;

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

        // ── 2. Map ───────────────────────────────────────────────────────────
        var dataDto = MapToLibDataDto(lib);

        // ── 3. Render ────────────────────────────────────────────────────────
        var bytes = await rendererService.RenderAsync(
            dataDto, DocumentType.Lib, request.Format, cancellationToken);

        // ── 4. Persist ───────────────────────────────────────────────────────
        var extension = request.Format == ExportFormat.Excel ? "xlsx" : "pdf";
        var fiscalYear = lib.FiscalYearEntity?.Year.ToString() ?? string.Empty;
        var fileName   = $"LIB_{lib.LIBNumber}_{DateTime.UtcNow:yyyyMMddHHmmss}.{extension}";
        var path       = await storageService.SaveAsync(bytes, fileName, cancellationToken);

        var record = new GeneratedDocumentEntity
        {
            DocumentType  = DocumentType.Lib,
            Format        = request.Format,
            OfficeId      = lib.OfficeId ?? Guid.Empty,
            StoragePath   = path,
            FileName      = fileName,
            FileSizeBytes = bytes.Length,
            FiscalYear    = fiscalYear,
            GeneratedBy   = request.GeneratedBy
        };

        await unitOfWork.GeneratedDocumentRepository.AddAsync(record, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(record.Id, "LIB document generated successfully.");
    }

    // ── Mapping ──────────────────────────────────────────────────────────────

    private static LibDataDto MapToLibDataDto(LibEntity lib)
    {
        var allDetails = CollectAllDetails(lib);

        var standaloneDetails = allDetails
            .Where(d => d.LineItemBudgetActivityId is null)
            .ToList();

        // Section I: group by Activity → ExpenseClass → Object (quarterly)
        var apiGroups = lib.LineItemBudgetActivities
            .Select(activity =>
            {
                var context = ResolveActivityContext(activity);
                var expenseGroups = BuildExpenseGroupsQuarterly(activity.LineItemBudgetDetails);
                return new LibApiGroupDto
                {
                    ActivityName    = activity.Name,
                    PrexcDynamicKra = context.PrexcDynamicKra,
                    GoalsOutcome    = context.GoalsOutcome,
                    ApiLabel        = context.ApiLabel,
                    // NepGaaLabel     = context.NepGaaLabel,
                    ExpenseGroups   = expenseGroups,
                    SubTotal        = expenseGroups.Sum(eg => eg.SubTotal)
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
                // NepGaaLabel     = "NEP/GAA",
                ExpenseGroups   = standaloneGroups,
                SubTotal        = standaloneGroups.Sum(eg => eg.SubTotal)
            });
        }

        var monthlyExpenseGroups  = BuildExpenseGroupsMonthly(allDetails);
        var accountGroupSummaries = BuildAccountGroupSummaries(allDetails);
        var quarterSummaries      = BuildQuarterSummaries(accountGroupSummaries);
        var targetGroups          = BuildTargetGroups(lib, standaloneDetails);

        var totalBudget = lib.TotalAmount ?? allDetails.Sum(d => d.Budget);

        var fundSourceAccountGroups = accountGroupSummaries
            .SelectMany(summary => summary.Rows.Select(row => new LibFundSourceAccountGroupDto
            {
                AllotmentClass   = summary.ExpenseClassType,
                AccountGroupName = row.AccountGroupName,
                Amount           = row.TotalBudget
            }))
            .OrderBy(group => group.AllotmentClass)
            .ThenBy(group => group.AccountGroupName)
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

        return new LibDataDto
        {
            LIBNumber             = lib.LIBNumber,
            OfficeName            = BuildAgencyName(lib),
            FiscalYear            = lib.FiscalYearEntity?.Year.ToString() ?? string.Empty,
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

    private static List<DetailEntity> CollectAllDetails(LibEntity lib)
    {
        var details = lib.LineItemBudgetActivities
            .SelectMany(activity => activity.LineItemBudgetDetails)
            .Concat(lib.LineItemBudgetDetails.Where(detail => detail.LineItemBudgetActivityId is null))
            .DistinctBy(detail => detail.Id)
            .ToList();

        if (details.Count == 0)
        {
            details = lib.LineItemBudgetDetails
                .DistinctBy(detail => detail.Id)
                .ToList();
        }

        return details;
    }

    private static List<LibTargetGroupDto> BuildTargetGroups(
        LibEntity lib,
        IEnumerable<DetailEntity> standaloneDetails)
    {
        var targetGroups = lib.LineItemBudgetActivities
            .Select(activity =>
            {
                var context = ResolveActivityContext(activity);
                var expenseGroups = BuildExpenseGroupsMonthly(activity.LineItemBudgetDetails);

                return new LibTargetGroupDto
                {
                    ActivityName    = activity.Name,
                    PrexcDynamicKra = context.PrexcDynamicKra,
                    GoalsOutcome    = context.GoalsOutcome,
                    KpiLabel        = context.KpiLabel,
                    // NepGaaLabel     = context.NepGaaLabel,
                    Targets         = ResolveTargets(activity),
                    ExpenseGroups   = expenseGroups,
                    SubTotal        = expenseGroups.Sum(group => group.SubTotal)
                };
            })
            .ToList();

        var standaloneGroupDetails = standaloneDetails.ToList();
        if (standaloneGroupDetails.Count > 0)
        {
            var expenseGroups = BuildExpenseGroupsMonthly(standaloneGroupDetails);
            targetGroups.Add(new LibTargetGroupDto
            {
                ActivityName    = "General",
                PrexcDynamicKra = string.Empty,
                GoalsOutcome    = string.Empty,
                KpiLabel        = string.Empty,
                // NepGaaLabel     = "NEP/GAA",
                Targets         = [],
                ExpenseGroups   = expenseGroups,
                SubTotal        = expenseGroups.Sum(group => group.SubTotal)
            });
        }

        return targetGroups;
    }

    private static List<LibExpenseGroupDto> BuildExpenseGroupsQuarterly(
        IEnumerable<DetailEntity> details)
    {
        return details
            .GroupBy(GetExpenseClassKey)
            .Select(ecGroup =>
            {
                var rows = ecGroup
                    .GroupBy(d => new { d.ObjectId, d.Object.Code, d.Object.Name })
                    .Select(objGroup => new LibRowDto
                    {
                        UACSCode    = objGroup.Key.Code,
                        ObjectName  = objGroup.Key.Name,
                        Description = objGroup.FirstOrDefault()?.Description,
                        Q1Budget    = objGroup.Sum(d => GetQuarterBudget(d, 1)),
                        Q2Budget    = objGroup.Sum(d => GetQuarterBudget(d, 2)),
                        Q3Budget    = objGroup.Sum(d => GetQuarterBudget(d, 3)),
                        Q4Budget    = objGroup.Sum(d => GetQuarterBudget(d, 4)),
                        TotalBudget = objGroup.Sum(d => d.Budget)
                    })
                    .ToList();

                return new LibExpenseGroupDto
                {
                    ExpenseClassName = ecGroup.Key.Name,
                    ExpenseClassType = ecGroup.Key.TypeCode,
                    Rows             = rows,
                    SubTotal         = rows.Sum(r => r.TotalBudget)
                };
            })
            .ToList();
    }

    private static List<LibExpenseGroupDto> BuildExpenseGroupsMonthly(
        ICollection<DetailEntity> details)
    {
        return details
            .GroupBy(GetExpenseClassKey)
            .Select(ecGroup =>
            {
                var rows = ecGroup
                    .GroupBy(d => new { d.ObjectId, d.Object.Code, d.Object.Name })
                    .Select(objGroup => new LibRowDto
                    {
                        UACSCode    = objGroup.Key.Code,
                        ObjectName  = objGroup.Key.Name,
                        JanBudget   = objGroup.Sum(d => GetMonthBudget(d,  1)),
                        FebBudget   = objGroup.Sum(d => GetMonthBudget(d,  2)),
                        MarBudget   = objGroup.Sum(d => GetMonthBudget(d,  3)),
                        AprBudget   = objGroup.Sum(d => GetMonthBudget(d,  4)),
                        MayBudget   = objGroup.Sum(d => GetMonthBudget(d,  5)),
                        JunBudget   = objGroup.Sum(d => GetMonthBudget(d,  6)),
                        JulBudget   = objGroup.Sum(d => GetMonthBudget(d,  7)),
                        AugBudget   = objGroup.Sum(d => GetMonthBudget(d,  8)),
                        SepBudget   = objGroup.Sum(d => GetMonthBudget(d,  9)),
                        OctBudget   = objGroup.Sum(d => GetMonthBudget(d, 10)),
                        NovBudget   = objGroup.Sum(d => GetMonthBudget(d, 11)),
                        DecBudget   = objGroup.Sum(d => GetMonthBudget(d, 12)),
                        TotalBudget = objGroup.Sum(d => d.Budget)
                    })
                    .ToList();

                return new LibExpenseGroupDto
                {
                    ExpenseClassName = ecGroup.Key.Name,
                    ExpenseClassType = ecGroup.Key.TypeCode,
                    Rows             = rows,
                    SubTotal         = rows.Sum(r => r.TotalBudget)
                };
            })
            .ToList();
    }

    private static List<LibAccountGroupSummaryDto> BuildAccountGroupSummaries(
        ICollection<DetailEntity> details)
    {
        return details
            .GroupBy(GetExpenseClassKey)
            .Select(ecGroup =>
            {
                var rows = ecGroup
                    .GroupBy(detail => detail.Object.Name)
                    .Select(group => new LibAccountGroupRowDto
                    {
                        AccountGroupName = group.Key,
                        Q1Budget         = group.Sum(detail => GetQuarterBudget(detail, 1)),
                        Q2Budget         = group.Sum(detail => GetQuarterBudget(detail, 2)),
                        Q3Budget         = group.Sum(detail => GetQuarterBudget(detail, 3)),
                        Q4Budget         = group.Sum(detail => GetQuarterBudget(detail, 4)),
                        TotalBudget      = group.Sum(detail => detail.Budget)
                    })
                    .OrderBy(row => row.AccountGroupName)
                    .ToList();

                return new LibAccountGroupSummaryDto
                {
                    ExpenseClassType = ecGroup.Key.TypeCode,
                    ExpenseClassName = ecGroup.Key.Name,
                    Rows             = rows,
                    Q1Budget         = rows.Sum(row => row.Q1Budget),
                    Q2Budget         = rows.Sum(row => row.Q2Budget),
                    Q3Budget         = rows.Sum(row => row.Q3Budget),
                    Q4Budget         = rows.Sum(row => row.Q4Budget),
                    TotalBudget      = rows.Sum(row => row.TotalBudget)
                };
            })
            .OrderBy(summary => summary.ExpenseClassType)
            .ThenBy(summary => summary.ExpenseClassName)
            .ToList();
    }

    private static List<LibQuarterSummaryDto> BuildQuarterSummaries(
        IEnumerable<LibAccountGroupSummaryDto> accountGroupSummaries)
    {
        return accountGroupSummaries
            .GroupBy(summary => summary.ExpenseClassType)
            .Select(group => new LibQuarterSummaryDto
            {
                AllotmentClass = group.Key,
                Q1Budget       = group.Sum(item => item.Q1Budget),
                Q2Budget       = group.Sum(item => item.Q2Budget),
                Q3Budget       = group.Sum(item => item.Q3Budget),
                Q4Budget       = group.Sum(item => item.Q4Budget),
                TotalBudget    = group.Sum(item => item.TotalBudget)
            })
            .OrderBy(summary => summary.AllotmentClass)
            .ToList();
    }

    private static (string PrexcDynamicKra, string GoalsOutcome, string ApiLabel, string KpiLabel)
        ResolveActivityContext(ActivityEntity activity)
    {
        var opcrItem = activity.OPCRActivity?.OPCRItem;
        var fyActiveKpi = opcrItem?.KPIAssignment?.FYActiveKPI;
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
            GoalsOutcome: goalsOutcome,
            ApiLabel: activity.Name,
            KpiLabel: kpiLabel
            // NepGaaLabel: "NEP/GAA"
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

    private static (string Name, string TypeCode) GetExpenseClassKey(DetailEntity detail)
    {
        var expenseClass = detail.Object?.ObjectExpenseClasses.FirstOrDefault()?.ExpenseClass;
        return (
            Name:     expenseClass?.Name ?? "Other",
            TypeCode: expenseClass?.Type.ToString() ?? "Other"
        );
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

        var detailQuarter = (detail.StartDate.Value.Month - 1) / 3 + 1;
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

        return detail.StartDate.Value.Month == month ? detail.Budget : 0m;
    }

    private static string BuildAgencyName(LibEntity lib)
    {
        var parts = new[]
        {
            lib.Office?.Name,
            lib.Office?.Cluster?.Name,
            lib.Office?.Organization?.Name
        };

        return string.Join(", ", parts.Where(part => !string.IsNullOrWhiteSpace(part)));
    }
}
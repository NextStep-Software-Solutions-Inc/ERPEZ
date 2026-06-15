using ERPEZ.Application.Common.Dtos;
using ERPEZ.Application.Interfaces.Services;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

using LibEntity    = ERPEZ.Domain.Entities.Planning.LineItemBudget;
using DetailEntity = ERPEZ.Domain.Entities.Planning.LineItemBudgetDetail;
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
        var allDetails = lib.LineItemBudgetDetails;

        // Section I: group by Activity → ExpenseClass → Object (quarterly)
        var apiGroups = lib.LineItemBudgetActivities
            .Select(activity =>
            {
                var expenseGroups = BuildExpenseGroupsQuarterly(activity.LineItemBudgetDetails);
                return new LibApiGroupDto
                {
                    ActivityName  = activity.Name,
                    ExpenseGroups = expenseGroups,
                    SubTotal      = expenseGroups.Sum(eg => eg.SubTotal)
                };
            })
            .ToList();

        // Standalone details (not assigned to any activity)
        var standaloneDetails = allDetails
            .Where(d => d.LineItemBudgetActivityId is null)
            .ToList();

        if (standaloneDetails.Count > 0)
        {
            var standaloneGroups = BuildExpenseGroupsQuarterly(standaloneDetails);
            apiGroups.Add(new LibApiGroupDto
            {
                ActivityName  = "General",
                ExpenseGroups = standaloneGroups,
                SubTotal      = standaloneGroups.Sum(eg => eg.SubTotal)
            });
        }

        var monthlyExpenseGroups  = BuildExpenseGroupsMonthly(allDetails);
        var accountGroupSummaries = BuildAccountGroupSummaries(allDetails);

        var totalBudget = lib.TotalAmount ?? allDetails.Sum(d => d.Budget);

        var fundSourceSummary = new LibFundSourceSummaryDto
        {
            FundSource  = lib.FundCluster?.Name ?? string.Empty,
            Q1Budget    = allDetails.Sum(d => GetQuarterBudget(d, 1)),
            Q2Budget    = allDetails.Sum(d => GetQuarterBudget(d, 2)),
            Q3Budget    = allDetails.Sum(d => GetQuarterBudget(d, 3)),
            Q4Budget    = allDetails.Sum(d => GetQuarterBudget(d, 4)),
            TotalBudget = totalBudget
        };

        return new LibDataDto
        {
            LIBNumber             = lib.LIBNumber,
            OfficeName            = lib.Office?.Name ?? string.Empty,
            FiscalYear            = lib.FiscalYearEntity?.Year.ToString() ?? string.Empty,
            FundCluster           = lib.FundCluster?.Name ?? string.Empty,
            IsFinal               = lib.Status.Equals("Approved", StringComparison.OrdinalIgnoreCase)
                                 || lib.Status.Equals("Final",    StringComparison.OrdinalIgnoreCase),
            TotalBudget           = totalBudget,
            ApiGroups             = apiGroups,
            MonthlyExpenseGroups  = monthlyExpenseGroups,
            AccountGroupSummaries = accountGroupSummaries,
            FundSourceSummary     = fundSourceSummary,
            Signatories           = []
        };
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
            .Select(ecGroup => new LibAccountGroupSummaryDto
            {
                ExpenseClassType = ecGroup.Key.TypeCode,
                ExpenseClassName = ecGroup.Key.Name,
                Q1Budget         = ecGroup.Sum(d => GetQuarterBudget(d, 1)),
                Q2Budget         = ecGroup.Sum(d => GetQuarterBudget(d, 2)),
                Q3Budget         = ecGroup.Sum(d => GetQuarterBudget(d, 3)),
                Q4Budget         = ecGroup.Sum(d => GetQuarterBudget(d, 4)),
                TotalBudget      = ecGroup.Sum(d => d.Budget)
            })
            .ToList();
    }

    private static (string Name, string TypeCode) GetExpenseClassKey(DetailEntity detail)
    {
        var expenseClass = detail.Object.ObjectExpenseClasses.FirstOrDefault()?.ExpenseClass;
        return (
            Name:     expenseClass?.Name ?? "Other",
            TypeCode: expenseClass?.Type.ToString() ?? "Other"
        );
    }

    private static decimal GetQuarterBudget(DetailEntity detail, int quarter)
    {
        if (detail.StartDate is null)
            return quarter == 1 ? detail.Budget : 0m;

        var detailQuarter = (detail.StartDate.Value.Month - 1) / 3 + 1;
        return detailQuarter == quarter ? detail.Budget : 0m;
    }

    private static decimal GetMonthBudget(DetailEntity detail, int month)
        => detail.StartDate?.Month == month ? detail.Budget : 0m;
}
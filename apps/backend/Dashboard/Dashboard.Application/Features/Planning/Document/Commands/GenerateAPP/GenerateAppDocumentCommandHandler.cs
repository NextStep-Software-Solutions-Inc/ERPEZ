using ERPEZ.Application.Common.Dtos;
using ERPEZ.Application.Interfaces.Services;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

using AppEntity     = ERPEZ.Domain.Entities.Planning.APP;
using AppItemEntity = ERPEZ.Domain.Entities.Planning.APPItem;

namespace ERPEZ.Application.Features.Planning.Document.Commands.GenerateAPP;

public class GenerateAppDocumentCommandHandler(
    IUnitOfWork              unitOfWork,
    IDocumentRendererService rendererService,
    IDocumentStorageService  storageService)
    : IRequestHandler<GenerateAppDocumentCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(
        GenerateAppDocumentCommand request,
        CancellationToken          cancellationToken)
    {
        // ── 1. Fetch APP Entity ──────────────────────────────────────────
        var app = await unitOfWork.APPRepository
            .GetAPPWithDetailsAsync(request.AppId, cancellationToken)
            ?? throw new NotFoundException("APP not found.");

        // ── 2. Map Entity to Data DTO ────────────────────────────────────
        var dataDto = await MapToDataDtoAsync(app, cancellationToken);

        // ── 3. Render ───────────────────────────────────────────────────
        var bytes = await rendererService.RenderAsync(
            dataDto, DocumentType.App, request.Format, cancellationToken);

        // ── 4. Persist ──────────────────────────────────────────────────
        var extension = request.Format == ExportFormat.Excel ? "xlsx" : "pdf";
        var fileName  = $"APP_{app.APPNumber}_{DateTime.UtcNow:yyyyMMddHHmmss}.{extension}";
        var path      = await storageService.SaveAsync(bytes, fileName, cancellationToken);

        var primaryOfficeId = app.APPItems.FirstOrDefault()?.OfficeId ?? Guid.Empty;

        var record = new GeneratedDocument
        {
            DocumentType  = DocumentType.App,
            Format        = request.Format,
            OfficeId      = primaryOfficeId,
            StoragePath   = path,
            FileName      = fileName,
            FileSizeBytes = bytes.Length,
            FiscalYear    = app.FiscalYear?.Year.ToString() ?? string.Empty,
            GeneratedBy   = request.GeneratedBy
        };

        await unitOfWork.GeneratedDocumentRepository.AddAsync(record, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(record.Id, "APP document generated successfully.");
    }

    private async Task<AppDataDto> MapToDataDtoAsync(AppEntity app, CancellationToken cancellationToken)
    {
        var generalRequirements = new List<AppItemRowDto>();
        var commonUseSupplies    = new List<AppItemRowDto>();
        var miscellaneousItems   = new List<AppItemRowDto>();

        var appItems = app.APPItems.Where(i => !i.IsDeleted).ToList();

        foreach (var item in appItems)
        {
            var row = MapToRow(item);

            // 1. Common-Use Supplies: If it has a CSEItemId, it is a CSE item
            if (item.PPMPItem?.CSEItemId != null)
            {
                commonUseSupplies.Add(row);
            }
            // 2. General Requirements: Infrastructure or Consulting Services
            else if (item.PPMPItem?.ProjectType == ProcurementProjectType.Infrastructure ||
                     item.PPMPItem?.ProjectType == ProcurementProjectType.ConsultingServices)
            {
                generalRequirements.Add(row);
            }
            // 3. Miscellaneous Items: Non-CSE Goods and others
            else
            {
                miscellaneousItems.Add(row);
            }
        }

        // Totals
        var totalEpa = appItems.Where(i => i.IsEarlyProcurementActivity).Sum(i => CalculateItemBudget(i));
        var totalCse = commonUseSupplies.Sum(i => i.EstimatedBudget);
        var totalEstimated = appItems.Sum(i => CalculateItemBudget(i));

        // Signatories
        var signatories = await BuildSignatoriesAsync(app, cancellationToken);

        var typeStr = app.APPType?.Trim() ?? "Indicative";
        bool isIndicative = string.Equals(typeStr, "Indicative", StringComparison.OrdinalIgnoreCase);
        bool isFinal = string.Equals(typeStr, "Final", StringComparison.OrdinalIgnoreCase);
        bool isUpdated = string.Equals(typeStr, "Updated", StringComparison.OrdinalIgnoreCase);

        var versionNum = app.VersionNumber.HasValue ? app.VersionNumber.Value.ToString() : string.Empty;
        var versionDate = app.VersionDate.HasValue ? app.VersionDate.Value.ToString("MMMM dd, yyyy") : string.Empty;

        return new AppDataDto
        {
            APPNumber            = app.APPNumber,
            FiscalYear           = app.FiscalYear?.Year.ToString() ?? string.Empty,
            Batch                = app.Batch,
            Quarter              = app.Quarter,
            IsIndicative         = isIndicative,
            IsFinal              = isFinal,
            IsUpdated            = isUpdated,
            VersionNumber        = versionNum,
            VersionDate          = versionDate,
            GeneralRequirements  = generalRequirements,
            CommonUseSupplies    = commonUseSupplies,
            MiscellaneousItems   = miscellaneousItems,
            TotalEpaProjects     = totalEpa,
            TotalCsePsDbm        = totalCse,
            TotalEstimatedBudget = totalEstimated,
            Signatories          = signatories
        };
    }

    private static AppItemRowDto MapToRow(AppItemEntity item)
    {
        var projectTitle = item.PPMPItem?.Name ?? string.Empty;
        var endUser      = item.Office?.Name ?? item.PPMPItem?.PPMPExpenditureItem?.PPMPActivity?.PPMP?.Office?.Name ?? string.Empty;
        var description  = item.PPMPItem?.Description ?? string.Empty;
        var mode         = item.ProcurementMode?.Name ?? string.Empty;
        var coveredByEpa = item.IsEarlyProcurementActivity;

        var criteria = item.BidEvaluationCriteria?.ToString() ?? "Domestic Preference";

        var startProc = item.StartOfProcurementOverride?.ToString("MM/yyyy")
                     ?? item.PPMPItem?.ProcurementStartDate?.ToString("MM/yyyy")
                     ?? string.Empty;

        var endProc   = item.EndOfProcurementOverride?.ToString("MM/yyyy")
                     ?? item.PPMPItem?.ProcurementEndDate?.ToString("MM/yyyy")
                     ?? string.Empty;

        var source    = item.FundSource?.Name ?? string.Empty;
        var budget    = CalculateItemBudget(item);
        var strategy  = item.ProcurementStrategies != null && item.ProcurementStrategies.Any()
            ? string.Join(", ", item.ProcurementStrategies.Select(FormatProcurementStrategy))
            : string.Empty;
        var remarks   = item.Remarks ?? string.Empty;

        return new AppItemRowDto
        {
            ProjectTitle               = projectTitle,
            EndUserOrImplementingUnit  = endUser,
            GeneralDescription         = description,
            ModeOfProcurement          = mode,
            CoveredByEpa               = coveredByEpa,
            CriteriaForBidEvaluation   = criteria,
            StartOfProcurement         = startProc,
            EndOfProcurement           = endProc,
            SourceOfFund               = source,
            EstimatedBudget            = budget,
            ProcurementStrategyOrTools = strategy,
            Remarks                    = remarks,
            IsNew                      = item.IsNew,
            IsRevised                  = item.IsRevised
        };
    }

    private static decimal CalculateItemBudget(AppItemEntity item)
    {
        return item.EstimatedBudgetOverride ?? (item.PPMPItem?.PPMPItemAllocations
            .Where(a => !a.IsDeleted)
            .Sum(a => a.Amount) ?? 0);
    }

    private async Task<List<SignatoryDto>> BuildSignatoriesAsync(AppEntity app, CancellationToken cancellationToken)
    {
        var activeSignatories = app.APPSignatories
            .Where(s => !s.IsDeleted)
            .OrderBy(s => s.SequenceOrder)
            .ToList();

        if (activeSignatories.Any())
        {
            return activeSignatories.Select(s =>
            {
                var label = GetRoleLabel(s.RoleKey);
                var name = !string.IsNullOrWhiteSpace(s.Name)
                    ? s.Name
                    : (s.User?.FullName ?? string.Empty);

                var position = !string.IsNullOrWhiteSpace(s.Position)
                    ? s.Position
                    : (s.PersonnelPosition?.Position?.Title ?? string.Empty);

                var designation = !string.IsNullOrWhiteSpace(s.Department)
                    ? s.Department
                    : (s.PersonnelPosition?.Position?.FunctionalTitle ?? string.Empty);

                return new SignatoryDto
                {
                    Label       = label,
                    PrintedName = name,
                    Position    = position,
                    Designation = designation,
                    Date        = s.SignatureDate
                };
            }).ToList();
        }

        // Fallback to global personnel position lookup only if no APP-specific signatories exist
        var signatories = new List<SignatoryDto>();

        // Prepared by (BAC Secretariat)
        var preparedBy = await FindSignatoryAsync("BAC Secretariat", "Prepared by:", cancellationToken);
        signatories.Add(preparedBy);

        // Recommended by (BAC Chairperson)
        var recommendedBy = await FindSignatoryAsync("BAC Chairperson", "Recommended by:", cancellationToken);
        if (recommendedBy.PrintedName == "TBD")
        {
            recommendedBy = await FindSignatoryAsync("BAC Chair", "Recommended by:", cancellationToken);
        }
        signatories.Add(recommendedBy);

        // Approved by (Head of the Procuring Entity)
        var approvedBy = await FindSignatoryAsync("Head of the Procuring Entity", "Approved by:", cancellationToken);
        if (approvedBy.PrintedName == "TBD")
        {
            approvedBy = await FindSignatoryAsync("HOPE", "Approved by:", cancellationToken);
        }
        signatories.Add(approvedBy);

        return signatories;
    }

    private static string GetRoleLabel(string roleKey)
    {
        if (string.IsNullOrWhiteSpace(roleKey)) return string.Empty;

        return roleKey.ToLowerInvariant() switch
        {
            "preparedby"  => "Prepared by:",
            "reviewedby"  => "Recommended by:",
            "approvedby"  => "Approved by:",
            "certifiedby" => "Certified by:",
            _             => roleKey.EndsWith(':') ? roleKey : $"{roleKey}:"
        };
    }

    private async Task<SignatoryDto> FindSignatoryAsync(string positionTitle, string label, CancellationToken cancellationToken)
    {
        var assignment = await unitOfWork.PersonnelPositionRepository.GetActiveByPositionTitleAsync(positionTitle, cancellationToken);

        if (assignment?.User != null)
        {
            return new SignatoryDto
            {
                Label       = label,
                PrintedName = assignment.User.FullName,
                Position    = assignment.Position?.Title ?? positionTitle,
                Designation = assignment.Position?.FunctionalTitle ?? string.Empty
            };
        }

        return new SignatoryDto
        {
            Label       = label,
            PrintedName = "TBD",
            Position    = positionTitle,
            Designation = string.Empty
        };
    }

    private static string FormatProcurementStrategy(ProcurementStrategy strategy) => strategy switch
    {
        ProcurementStrategy.LCA => "LCA",
        ProcurementStrategy.Subcontracting => "Subcontracting",
        ProcurementStrategy.MultiYearContracting => "Multi-Year Contracting",
        ProcurementStrategy.DesignAndBuild => "Design and Build",
        ProcurementStrategy.ProcurementAgent => "Engagement of a Procurement Agent",
        ProcurementStrategy.FrameworkAgreement => "Use of Framework Agreement",
        ProcurementStrategy.PooledProcurement => "Pooled Procurement",
        ProcurementStrategy.RenewalOfServices => "Renewal of Regular and Recurring Services",
        ProcurementStrategy.WarehousingInventory => "Warehousing & Inventory",
        ProcurementStrategy.NotApplicable => "Not Applicable",
        _ => FormatPascalCase(strategy.ToString())
    };

    private static string FormatPascalCase(string value)
    {
        if (string.IsNullOrWhiteSpace(value)) return string.Empty;
        if (value.Contains(' ') || value.Contains('-')) return value;
        return System.Text.RegularExpressions.Regex.Replace(value, "(?<!^)([A-Z])", " $1");
    }
}
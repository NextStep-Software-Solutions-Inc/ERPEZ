using ERPEZ.Application.Common.Dtos;
using ERPEZ.Application.Interfaces.Services;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

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

        var record = new GeneratedDocument
        {
            DocumentType  = DocumentType.App,
            Format        = request.Format,
            OfficeId      = app.OfficeId,
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

    private async Task<AppDataDto> MapToDataDtoAsync(APP app, CancellationToken cancellationToken)
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
        var signatories = await BuildSignatoriesAsync(cancellationToken);

        // Map status: Indicative, Final, or Updated
        bool isIndicative = false;
        bool isFinal = false;
        bool isUpdated = false;

        var isFinalStr = app.IsFinal?.Trim().ToLowerInvariant();
        if (isFinalStr == "true" || isFinalStr == "final")
        {
            isFinal = true;
        }
        else if (isFinalStr == "indicative")
        {
            isIndicative = true;
        }
        else if (isFinalStr == "updated" || isFinalStr == "revised")
        {
            isUpdated = true;
        }
        else
        {
            // Fallback default
            isIndicative = true;
        }

        return new AppDataDto
        {
            OfficeId             = app.OfficeId,
            APPNumber            = app.APPNumber,
            FiscalYear           = app.FiscalYear?.Year.ToString() ?? string.Empty,
            IsIndicative         = isIndicative,
            IsFinal              = isFinal,
            IsUpdated            = isUpdated,
            VersionNumber        = app.APPNumber.Contains("-") ? app.APPNumber.Split('-').Last() : "1",
            GeneralRequirements  = generalRequirements,
            CommonUseSupplies    = commonUseSupplies,
            MiscellaneousItems   = miscellaneousItems,
            TotalEpaProjects     = totalEpa,
            TotalCsePsDbm        = totalCse,
            TotalEstimatedBudget = totalEstimated,
            Signatories          = signatories
        };
    }

    private static AppItemRowDto MapToRow(APPItem item)
    {
        var projectTitle = item.PPMPItem?.Name ?? string.Empty;
        var endUser      = item.Office?.Name ?? string.Empty;
        var description  = item.PPMPItem?.Description ?? string.Empty;
        var mode         = item.ProcurementMode?.Name ?? string.Empty;
        var coveredByEpa = item.IsEarlyProcurementActivity;

        var criteria = item.BidEvaluationCriteria != null && item.BidEvaluationCriteria.Any()
            ? string.Join(", ", item.BidEvaluationCriteria)
            : "Domestic Preference";

        var startProc = item.PPMPItem?.ProcurementStartDate?.ToString("MM/yyyy") ?? string.Empty;
        var endProc   = item.PPMPItem?.ProcurementEndDate?.ToString("MM/yyyy")   ?? string.Empty;
        var source    = item.FundSource?.Name ?? string.Empty;
        var budget    = CalculateItemBudget(item);
        var strategy  = item.ProcurementStrategy ?? string.Empty;
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
            Remarks                    = remarks
        };
    }

    private static decimal CalculateItemBudget(APPItem item)
    {
        return item.PPMPItem?.PPMPItemAllocations
            .Where(a => !a.IsDeleted)
            .Sum(a => a.Amount) ?? 0;
    }

    private async Task<List<SignatoryDto>> BuildSignatoriesAsync(CancellationToken cancellationToken)
    {
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

    private async Task<SignatoryDto> FindSignatoryAsync(string positionTitle, string label, CancellationToken cancellationToken)
    {
        var query = unitOfWork.PersonnelPositionRepository.Query(pp => pp.IsActive && !pp.IsDeleted)
            .Include(pp => pp.User)
            .Include(pp => pp.Position)
            .Where(pp => pp.Position != null && 
                        (pp.Position.Title.ToLower().Contains(positionTitle.ToLower()) || 
                         (pp.Position.FunctionalTitle != null && pp.Position.FunctionalTitle.ToLower().Contains(positionTitle.ToLower()))));

        var assignment = await unitOfWork.PersonnelPositionRepository.GetFirstAsync(query, cancellationToken);

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
}
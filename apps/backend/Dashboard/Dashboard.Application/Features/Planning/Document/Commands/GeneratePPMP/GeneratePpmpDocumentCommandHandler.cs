using ERPEZ.Application.Common.Dtos;
using ERPEZ.Domain.Entities.Planning; 
using ERPEZ.Application.Interfaces.Services;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

// These aliases resolve the CS0118 namespace-vs-type collision
using PpmpEntity     = ERPEZ.Domain.Entities.Planning.PPMP;
using PpmpItemEntity = ERPEZ.Domain.Entities.Planning.PPMPItem;
using ObjectEntity   = ERPEZ.Domain.Entities.Planning.Object;

namespace ERPEZ.Application.Features.Planning.Document.Commands.GeneratePPMP;

public class GeneratePpmpDocumentCommandHandler(
    IUnitOfWork              unitOfWork,
    IDocumentRendererService rendererService,
    IDocumentStorageService  storageService)
    : IRequestHandler<GeneratePpmpDocumentCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(
        GeneratePpmpDocumentCommand request,
        CancellationToken           cancellationToken)
    {
        // ── 1. Fetch ────────────────────────────────────────────────────
        var ppmp = await unitOfWork.PPMPRepository
            .GetPPMPWithDetailsAsync(request.PpmpId, cancellationToken)
            ?? throw new NotFoundException("PPMP not found.");

        // Fetch source PPMP if this is a Supplemental PPMP and not already loaded
        PpmpEntity? sourcePpmp = ppmp.SourcePPMP;
        if (sourcePpmp == null && ppmp.PPMPType == PPMPTypeEnum.Supplemental && ppmp.SourcePPMPId.HasValue)
        {
            sourcePpmp = await unitOfWork.PPMPRepository
                .GetPPMPWithDetailsAsync(ppmp.SourcePPMPId.Value, cancellationToken);
        }

        // ── 2. Map ──────────────────────────────────────────────────────
        var dataDto = MapToDataDto(ppmp, sourcePpmp);

        // ── 3. Render ───────────────────────────────────────────────────
        var bytes = await rendererService.RenderAsync(
            dataDto, DocumentType.Ppmp, request.Format, cancellationToken);

        // ── 4. Persist ──────────────────────────────────────────────────
        var extension = request.Format == ExportFormat.Excel ? "xlsx" : "pdf";
        var fileName  = $"PPMP_{ppmp.PPMPNumber}_{DateTime.UtcNow:yyyyMMddHHmmss}.{extension}";
        var path      = await storageService.SaveAsync(bytes, fileName, cancellationToken);

        var record = new GeneratedDocument
        {
            DocumentType     = DocumentType.Ppmp,
            SourceDocumentId = ppmp.Id,
            Format           = request.Format,
            OfficeId         = ppmp.OfficeId,     // ← was AgencyId; matches GeneratedDocument entity
            StoragePath      = path,
            FileName         = fileName,
            FileSizeBytes    = bytes.Length,
            FiscalYear       = ppmp.FiscalYear?.Year.ToString() ?? string.Empty,
            GeneratedBy      = request.GeneratedBy
        };

        await unitOfWork.GeneratedDocumentRepository.AddAsync(record, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(record.Id, "PPMP document generated successfully.");
    }

    // ── Mapping ──────────────────────────────────────────────────────────────

    private static PpmpDataDto MapToDataDto(PpmpEntity ppmp, PpmpEntity? sourcePpmp = null)
    {
        var activityItems = ppmp.PPMPActivities
            .Where(a => !a.IsDeleted)
            .SelectMany(a => a.PPMPExpenditureItems.Where(e => !e.IsDeleted))
            .SelectMany(e => e.PPMPItems.Where(i => !i.IsDeleted));

        var projectItems = ppmp.PPMPExpenditureItems
            .Where(e => !e.IsDeleted && e.PPMPActivityId == null)
            .SelectMany(e => e.PPMPItems.Where(i => !i.IsDeleted));

        var allItems = activityItems.Concat(projectItems).DistinctBy(i => i.Id).ToList();

        List<PpmpItemEntity> sourceItems = [];
        if (sourcePpmp != null)
        {
            var srcActivityItems = sourcePpmp.PPMPActivities
                .Where(a => !a.IsDeleted)
                .SelectMany(a => a.PPMPExpenditureItems.Where(e => !e.IsDeleted))
                .SelectMany(e => e.PPMPItems.Where(i => !i.IsDeleted));

            var srcProjectItems = sourcePpmp.PPMPExpenditureItems
                .Where(e => !e.IsDeleted && e.PPMPActivityId == null)
                .SelectMany(e => e.PPMPItems.Where(i => !i.IsDeleted));

            sourceItems = srcActivityItems.Concat(srcProjectItems).DistinctBy(i => i.Id).ToList();
        }

        var rows        = allItems.Select(item => MapToRow(item, ppmp, sourceItems)).ToList();
        var totalBudget = rows.Sum(r => r.EstimatedBudget);
        var signatories = BuildSignatories(ppmp);

        return new PpmpDataDto
        {
            OfficeId           = ppmp.OfficeId,
            PpmpNumber         = ppmp.PPMPNumber,
            FiscalYear         = ppmp.FiscalYear?.Year.ToString() ?? string.Empty,
            EndUserUnit        = ppmp.Office?.Name ?? string.Empty,
            IsFinal            = ppmp.IsFinal,
            IsSupplemental     = ppmp.PPMPType == ERPEZ.Domain.Enums.PPMPTypeEnum.Supplemental,
            SourcePpmpNumber   = ppmp.SourcePPMP?.PPMPNumber,
            SupplementalNumber = ppmp.SupplementalNumber,
            TotalBudget        = totalBudget,
            Rows               = rows,
            Signatories        = signatories
        };
    }

    private static PpmpRowDto MapToRow(PpmpItemEntity item, PpmpEntity ppmp, List<PpmpItemEntity>? sourceItems = null)
    {
        var allocations   = item.PPMPItemAllocations.Where(a => !a.IsDeleted).ToList();
        var allocQuantity = allocations.Sum(a => a.Quantity);
        var allocAmount   = allocations.Sum(a => a.Amount);

        var totalQuantity = allocQuantity > 0
            ? allocQuantity
            : (item.PlannedQuantity > 0 ? item.PlannedQuantity : 0);

        var unitPrice = item.UnitPrice > 0
            ? item.UnitPrice
            : (item.CSEItem?.ItemPrices?.OrderByDescending(p => p.FiscalYear?.Year ?? 0).FirstOrDefault()?.UnitPrice
               ?? item.NonCSEItem?.CurrentPrice
               ?? 0m);

        var totalAmount = allocAmount > 0
            ? allocAmount
            : (totalQuantity * unitPrice);

        // Col 1 — General Description and Objective of the Project to be Procured (Name only)
        var description = item.Name;

        // Col 2 — Type of Project (per NGPA PPMP guide)
        var projectType = item.ProjectType switch
        {
            ProcurementProjectType.Infrastructure         => "Infrastructure",
            ProcurementProjectType.ConsultingServices     => "Consulting Services",
            ProcurementProjectType.GeneralSupportServices => "Goods (General Support Services)",
            _                                             => "Goods"
        };

        // Col 3 — Quantity and Size of the Project to be Procured
        var baseQuantityAndSize = $"{totalQuantity:N0} {item.Unit}".Trim();
        var hasDistinctDescription = !string.IsNullOrWhiteSpace(item.Description) &&
                                     !item.Description.Trim().Equals(item.Name.Trim(), StringComparison.OrdinalIgnoreCase);

        var quantityAndSize = hasDistinctDescription
            ? $"{baseQuantityAndSize}\n{item.Description!.Trim()}"
            : baseQuantityAndSize;

        // Col 4 — Mode of Procurement
        var procurementMode = item.ProcurementMode?.Name ?? string.Empty;

        // Col 5 — Pre-Procurement Conference
        var preProc = item.PreProcurementConference switch
        {
            true  => "Yes",
            false => "No",
            null  => "N/A"
        };

        // Col 6 & 7 — Procurement Timeline
        var startProc = item.ProcurementStartDate?.ToString("MM/yyyy") ?? string.Empty;
        var endProc   = item.ProcurementEndDate?.ToString("MM/yyyy")   ?? string.Empty;

        // Col 8 — Expected Delivery Period
        var delivery = (item.ExpectedDeliveryStart, item.ExpectedDeliveryEnd) switch
        {
            ({ } s, { } e) when s == e => s.ToString("MM/yyyy"),
            ({ } s, { } e)             => $"{s:MM/yyyy} to {e:MM/yyyy}",
            ({ } s, null)              => s.ToString("MM/yyyy"),
            _                          => string.Empty
        };

        // Col 9 — Source of Funds (Authoritatively composed from FundSource, FY, ExpenseClass, and UACS Object)
        var fundSource = ppmp.FundSource
                         ?? ppmp.LineItemBudget?.FundSource
                         ?? item.PPMPExpenditureItem?.PPMPActivity?.LIBActivity?.LineItemBudget?.FundSource;

        var fundSourceParts = new List<string>();
        if (fundSource != null && !string.IsNullOrWhiteSpace(fundSource.Name))
        {
            fundSourceParts.Add(fundSource.Name.Trim());
        }

        var fiscalYear = ppmp.FiscalYear
                         ?? ppmp.LineItemBudget?.FiscalYearEntity
                         ?? item.PPMPExpenditureItem?.PPMPActivity?.LIBActivity?.LineItemBudget?.FiscalYearEntity;

        if (fiscalYear != null)
        {
            fundSourceParts.Add($"FY {fiscalYear.Year}");
        }

        var typeOfExpenditure = ResolveTypeOfExpenditure(item.PPMPExpenditureItem?.Object);
        if (!string.IsNullOrWhiteSpace(typeOfExpenditure))
        {
            fundSourceParts.Add(typeOfExpenditure);
        }

        var headerFunding = string.Join(" ", fundSourceParts).Trim();
        var objectName = item.PPMPExpenditureItem?.Object?.Name?.Trim();

        var sourceOfFunds = !string.IsNullOrWhiteSpace(headerFunding) && !string.IsNullOrWhiteSpace(objectName)
            ? $"{headerFunding}, {objectName}"
            : (!string.IsNullOrWhiteSpace(headerFunding) ? headerFunding : (objectName ?? string.Empty));

        // Col 11 — Attached Supporting Documents (Blank when no explicit document is attached; no synthetic values)
        var supportingDocs = string.Empty;

        // Tag supplemental changes in Remarks if applicable
        var remarks = item.Remarks ?? string.Empty;
        if (ppmp.PPMPType == PPMPTypeEnum.Supplemental && sourceItems != null && sourceItems.Count > 0)
        {
            var matched = sourceItems.FirstOrDefault(s =>
                (item.CSEItemId.HasValue && s.CSEItemId == item.CSEItemId) ||
                (item.NonCSEItemId.HasValue && s.NonCSEItemId == item.NonCSEItemId) ||
                (!string.IsNullOrWhiteSpace(item.Name) && !string.IsNullOrWhiteSpace(s.Name) &&
                 string.Equals(item.Name.Trim(), s.Name.Trim(), StringComparison.OrdinalIgnoreCase)));

            if (matched == null)
            {
                // New items in supplemental PPMP retain their original remarks without [NEW ITEM] prefix
            }
            else
            {
                var isModified = matched.PlannedQuantity != item.PlannedQuantity ||
                                 matched.UnitPrice != item.UnitPrice ||
                                 matched.ProcurementModeId != item.ProcurementModeId ||
                                 matched.ProjectType != item.ProjectType ||
                                 matched.ProcurementStartDate != item.ProcurementStartDate ||
                                 matched.ProcurementEndDate != item.ProcurementEndDate ||
                                 matched.ExpectedDeliveryStart != item.ExpectedDeliveryStart ||
                                 matched.ExpectedDeliveryEnd != item.ExpectedDeliveryEnd ||
                                 !string.Equals(matched.Remarks?.Trim(), item.Remarks?.Trim(), StringComparison.Ordinal);

                if (isModified)
                {
                    remarks = string.IsNullOrWhiteSpace(remarks)
                        ? "[MODIFIED]"
                        : $"[MODIFIED] {remarks}";
                }
            }
        }

        return new PpmpRowDto
        {
            GeneralDescription          = description,
            ProjectType                 = projectType,
            QuantityAndSize             = quantityAndSize,
            ProcurementMode             = procurementMode,
            PreProcurementConference    = preProc,
            StartOfProcurement          = startProc,
            EndOfProcurement            = endProc,
            ExpectedDeliveryPeriod      = delivery,
            SourceOfFunds               = sourceOfFunds,
            EstimatedBudget             = totalAmount,
            AttachedSupportingDocuments = supportingDocs,
            Remarks                     = remarks
        };
    }

    private static List<SignatoryDto> BuildSignatories(PpmpEntity ppmp)
    {
        var events = ppmp.ApprovalEvents.Where(e => !e.IsDeleted).ToList();

        var preparer = events
            .Where(e => e.Action.Equals("Submit", StringComparison.OrdinalIgnoreCase))
            .OrderByDescending(e => e.Timestamp)
            .FirstOrDefault();

        var approver = events
            .Where(e => e.Action.Equals("Approve", StringComparison.OrdinalIgnoreCase))
            .OrderByDescending(e => e.Timestamp)
            .FirstOrDefault();

        return
        [
            new SignatoryDto
            {
                Label       = "Prepared by:",
                PrintedName = preparer?.ActorName ?? string.Empty,
                Position    = ppmp.Office?.Name   ?? string.Empty,
                Designation = "End-User or Implementing Unit",
                Date        = preparer?.Timestamp
                        },
            new SignatoryDto
            {
                Label       = "Funds Available:",
                PrintedName = string.Empty, // populated from finance approval event if available
                Position    = string.Empty,
                Designation = "Director, Financial Management Services",
                Date        = null
            },
            new SignatoryDto
            {
                Label       = "Submitted by:",
                PrintedName = approver?.ActorName ?? string.Empty,
                Position    = ppmp.Office?.Name   ?? string.Empty,
                Designation = "Head of the End-User or Implementing Unit",
                Date        = approver?.Timestamp
            }
        ];
    }

    private static string ResolveTypeOfExpenditure(ObjectEntity? obj)
    {
        if (obj == null) return string.Empty;

        // 1. If ObjectExpenseClasses is present and active, use ExpenseClass Name
        var activeExpenseClass = obj.ObjectExpenseClasses?
            .Where(oec => oec.IsActive && oec.ExpenseClass != null && oec.ExpenseClass.IsActive)
            .Select(oec => oec.ExpenseClass!.Name.Trim())
            .FirstOrDefault(name => !string.IsNullOrWhiteSpace(name));

        if (!string.IsNullOrWhiteSpace(activeExpenseClass))
        {
            return CleanExpenseClassName(activeExpenseClass);
        }

        // 2. If parent hierarchy is present, traverse to highest non-root ancestor
        var current = obj.ParentObject;
        string? highestNonRootName = null;

        while (current != null)
        {
            var pName = current.Name?.Trim() ?? string.Empty;
            var pCode = current.Code?.Trim() ?? string.Empty;

            if (IsRootNode(pCode, pName))
            {
                break;
            }

            highestNonRootName = pName;
            current = current.ParentObject;
        }

        if (!string.IsNullOrWhiteSpace(highestNonRootName))
        {
            return CleanExpenseClassName(highestNonRootName);
        }

        // 3. Authoritative standard UACS expense class mapping by Code prefix or Name
        var cleanCode = (obj.Code ?? string.Empty).Replace("-", "").Replace(":", "").Trim();
        var lowerName = (obj.Name ?? string.Empty).ToLowerInvariant();

        if (cleanCode.StartsWith("501", StringComparison.OrdinalIgnoreCase) || 
            cleanCode.StartsWith("51", StringComparison.OrdinalIgnoreCase) ||
            cleanCode.StartsWith("PS", StringComparison.OrdinalIgnoreCase) ||
            lowerName.Contains("personnel services"))
        {
            return "Personnel Services";
        }

        if (cleanCode.StartsWith("502", StringComparison.OrdinalIgnoreCase) || 
            cleanCode.StartsWith("52", StringComparison.OrdinalIgnoreCase) ||
            cleanCode.StartsWith("MOOE", StringComparison.OrdinalIgnoreCase) ||
            lowerName.Contains("maintenance and other operating"))
        {
            return "Maintenance and Other Operating Expenses";
        }

        if (cleanCode.StartsWith("503", StringComparison.OrdinalIgnoreCase) || 
            cleanCode.StartsWith("53", StringComparison.OrdinalIgnoreCase) ||
            cleanCode.StartsWith("FE", StringComparison.OrdinalIgnoreCase) ||
            lowerName.Contains("financial expenses"))
        {
            return "Financial Expenses";
        }

        if (cleanCode.StartsWith("506", StringComparison.OrdinalIgnoreCase) || 
            cleanCode.StartsWith("56", StringComparison.OrdinalIgnoreCase) ||
            cleanCode.StartsWith("106", StringComparison.OrdinalIgnoreCase) || 
            cleanCode.StartsWith("16", StringComparison.OrdinalIgnoreCase) || 
            cleanCode.StartsWith("107", StringComparison.OrdinalIgnoreCase) ||
            cleanCode.StartsWith("CO", StringComparison.OrdinalIgnoreCase) ||
            lowerName.Contains("capital outlay") ||
            lowerName.Contains("property, plant and equipment"))
        {
            return "Capital Outlays";
        }

        return string.Empty;
    }

    private static bool IsRootNode(string code, string name)
    {
        if (string.IsNullOrWhiteSpace(code) && string.IsNullOrWhiteSpace(name))
            return true;

        return string.Equals(name, "Expenses", StringComparison.OrdinalIgnoreCase) ||
               string.Equals(code, "CLS:Expenses", StringComparison.OrdinalIgnoreCase) ||
               code == "50000000" ||
               code.StartsWith("50000000");
    }

    private static string CleanExpenseClassName(string name)
    {
        var cleaned = System.Text.RegularExpressions.Regex.Replace(name, @"^(SC|GRP|CAT):\s*", "", System.Text.RegularExpressions.RegexOptions.IgnoreCase).Trim();
        if (cleaned.Contains("Maintenance and Other Operating", StringComparison.OrdinalIgnoreCase))
            return "Maintenance and Other Operating Expenses";
        if (cleaned.Contains("Personnel Services", StringComparison.OrdinalIgnoreCase))
            return "Personnel Services";
        if (cleaned.Contains("Financial Expenses", StringComparison.OrdinalIgnoreCase))
            return "Financial Expenses";
        if (cleaned.Contains("Capital Outlay", StringComparison.OrdinalIgnoreCase))
            return "Capital Outlays";
        return cleaned;
    }
}
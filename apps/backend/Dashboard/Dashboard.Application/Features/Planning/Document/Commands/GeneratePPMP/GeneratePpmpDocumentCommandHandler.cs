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

        // ── 2. Map ──────────────────────────────────────────────────────
        var dataDto = MapToDataDto(ppmp);

        // ── 3. Render ───────────────────────────────────────────────────
        var bytes = await rendererService.RenderAsync(
            dataDto, DocumentType.Ppmp, request.Format, cancellationToken);

        // ── 4. Persist ──────────────────────────────────────────────────
        var extension = request.Format == ExportFormat.Excel ? "xlsx" : "pdf";
        var fileName  = $"PPMP_{ppmp.PPMPNumber}_{DateTime.UtcNow:yyyyMMddHHmmss}.{extension}";
        var path      = await storageService.SaveAsync(bytes, fileName, cancellationToken);

        var record = new GeneratedDocument
        {
            DocumentType  = DocumentType.Ppmp,
            Format        = request.Format,
            OfficeId      = ppmp.OfficeId,     // ← was AgencyId; matches GeneratedDocument entity
            StoragePath   = path,
            FileName      = fileName,
            FileSizeBytes = bytes.Length,
            FiscalYear    = ppmp.FiscalYear?.Year.ToString() ?? string.Empty,
            GeneratedBy   = request.GeneratedBy
        };

        await unitOfWork.GeneratedDocumentRepository.AddAsync(record, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(record.Id, "PPMP document generated successfully.");
    }

    // ── Mapping ──────────────────────────────────────────────────────────────

    private static PpmpDataDto MapToDataDto(PpmpEntity ppmp)
    {
        var allItems = ppmp.PPMPActivities
            .Where(a => !a.IsDeleted)
            .SelectMany(a => a.PPMPExpenditureItems.Where(e => !e.IsDeleted))
            .SelectMany(e => e.PPMPItems.Where(i => !i.IsDeleted))
            .ToList();

        var rows        = allItems.Select(item => MapToRow(item, ppmp)).ToList();
        var totalBudget = rows.Sum(r => r.EstimatedBudget);
        var signatories = BuildSignatories(ppmp);

        return new PpmpDataDto
        {
            OfficeId    = ppmp.OfficeId,
            PpmpNumber  = ppmp.PPMPNumber,
            FiscalYear  = ppmp.FiscalYear?.Year.ToString() ?? string.Empty,
            EndUserUnit = ppmp.Office?.Name ?? string.Empty,
            IsFinal     = ppmp.IsFinal,
            TotalBudget = totalBudget,
            Rows        = rows,
            Signatories = signatories
        };
    }

    private static PpmpRowDto MapToRow(PpmpItemEntity item, PpmpEntity ppmp)
    {
        var allocations   = item.PPMPItemAllocations.Where(a => !a.IsDeleted).ToList();
        var totalQuantity = allocations.Sum(a => a.Quantity);
        var totalAmount   = allocations.Sum(a => a.Amount);

        // Col 1 — General Description
        var description = string.IsNullOrWhiteSpace(item.Description)
            ? item.Name
            : $"{item.Name} — {item.Description}";

        // Col 2 — Type of Project (per NGPA PPMP guide)
        var projectType = item.ProjectType switch
        {
            ProcurementProjectType.Infrastructure         => "Infrastructure",
            ProcurementProjectType.ConsultingServices     => "Consulting Services",
            ProcurementProjectType.GeneralSupportServices => "Goods (General Support Services)",
            _                                             => "Goods"
        };

        // Col 3 — Quantity and Size
        var quantityAndSize = $"{totalQuantity:N0} {item.Unit}".Trim();

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

        // Col 9 — Source of Funds (PPMP-level)
        var sourceOfFunds = ppmp.FundSource?.Name ?? string.Empty;

        // Col 11 — Supporting Documents
        var supportingDocs = DeriveExpectedSupportingDocs(item.ProcurementMode?.Name);

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
            Remarks                     = item.Remarks ?? string.Empty
        };
    }

    private static string DeriveExpectedSupportingDocs(string? procurementModeName)
    {
        const string marketScoping = "Market Scoping Checklist";
        const string techSpecs     = "Technical Specifications";

        if (string.IsNullOrWhiteSpace(procurementModeName))
            return $"{marketScoping}, {techSpecs}";

        var lower = procurementModeName.ToLowerInvariant();

        if (lower.Contains("consulting") || lower.Contains("technical consultant"))
            return $"{marketScoping}, Terms of Reference";

        if (lower.Contains("infrastructure") || lower.Contains("construction"))
            return $"{marketScoping}, Scope of Work, Engineering Plan, Feasibility Study";

        return $"{marketScoping}, {techSpecs}";
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
}
using ERPEZ.Application.Features.Planning.Document.Dtos;
using ERPEZ.Application.Interfaces.Services;
using ERPEZ.Application.Common.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

using OPCREntity        = ERPEZ.Domain.Entities.Planning.OPCR;
using OPCRItemEntity    = ERPEZ.Domain.Entities.Planning.OPCRItem;
using GeneratedDocument = ERPEZ.Domain.Entities.Planning.GeneratedDocument;

namespace ERPEZ.Application.Features.Planning.Document.Commands.GenerateConsolidatedOPCR;

public class GenerateConsolidatedOpcrDocumentCommandHandler(
    IUnitOfWork              unitOfWork,
    IDocumentRendererService rendererService,
    IDocumentStorageService  storageService)
    : IRequestHandler<GenerateConsolidatedOpcrDocumentCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(
        GenerateConsolidatedOpcrDocumentCommand request,
        CancellationToken cancellationToken)
    {
        // ── 1. Fetch consolidation with all OPCRs + nested data ───────────
        var consolidation = await unitOfWork.OPCRConsolidationRepository
            .GetConsolidationWithOPCRsAsync(request.ConsolidationId, cancellationToken)
            ?? throw new NotFoundException("OPCR Consolidation not found.");

        if (consolidation.OPCRs.Count == 0)
            throw new NotFoundException(
                "No OPCRs found in this consolidation.");

        // ── 2. Map ────────────────────────────────────────────────────────
        var dataDto = MapToDto(consolidation, request.RatingPeriod);

        // ── 3. Render ─────────────────────────────────────────────────────
        var bytes = await rendererService.RenderAsync(
            dataDto, DocumentType.ConsolidatedOpcr, request.Format, cancellationToken);

        // ── 4. Persist ────────────────────────────────────────────────────
        var ext      = request.Format == ExportFormat.Excel ? "xlsx" : "pdf";
        var fileName = $"CONSOLIDATED_OPCR_{consolidation.Name}_{DateTime.UtcNow:yyyyMMddHHmmss}.{ext}";
        var path     = await storageService.SaveAsync(bytes, fileName, cancellationToken);

        var record = new GeneratedDocument
        {
            DocumentType  = DocumentType.ConsolidatedOpcr,
            Format        = request.Format,
            OfficeId      = consolidation.OPCRs.First().OfficeId,
            StoragePath   = path,
            FileName      = fileName,
            FileSizeBytes = bytes.Length,
            FiscalYear    = consolidation.FiscalYear?.Year.ToString() ?? string.Empty,
            GeneratedBy   = request.GeneratedBy
        };

        await unitOfWork.GeneratedDocumentRepository.AddAsync(record, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(record.Id,
            "Consolidated OPCR document generated successfully.");
    }

    // ── Mapping ───────────────────────────────────────────────────────────────

    private static ConsolidatedOpcrDataDto MapToDto(
        Domain.Entities.Planning.OPCRConsolidation consolidation,
        string ratingPeriod)
    {
        var opcrs      = consolidation.OPCRs.Where(o => !o.IsDeleted).ToList();
        var agencyName = opcrs.FirstOrDefault()?.Office?.Organization?.Name ?? string.Empty;

        var allItems = opcrs
            .SelectMany(o => o.OPCRItems
                .Where(i => !i.IsDeleted && i.KPIAssignment?.FYActiveKPI != null)
                .Select(i => new { Item = i, OPCR = o }))
            .ToList();

        var kpiGroups = allItems
            .GroupBy(x => x.Item.KPIAssignment!.FYActiveKPIId)
            .OrderBy(g =>
            {
                var cat = g.First().Item.KPIAssignment!.FYActiveKPI!.FunctionCategory;
                return cat switch
                {
                    "Strategic" => 0, "Core" => 1, "Mandatory" => 2, _ => 99
                };
            })
            .ThenBy(g => g.First().Item.KPIAssignment!.FYActiveKPI!.Code)
            .Select(g => MapKpiGroup(g.Select(x => x.Item).ToList()))
            .ToList();

        return new ConsolidatedOpcrDataDto
        {
            AgencyName   = agencyName,
            FiscalYear   = consolidation.FiscalYear?.Year.ToString() ?? string.Empty,
            RatingPeriod = ratingPeriod,
            TotalBudget  = kpiGroups.Sum(k => k.KpiTotalBudget),
            KpiGroups    = kpiGroups,
            Signatories  = BuildSignatories()
        };
    }

    private static ConsolidatedKpiGroupDto MapKpiGroup(List<OPCRItemEntity> items)
    {
        var firstItem = items.First();
        var fy        = firstItem.KPIAssignment!.FYActiveKPI!;
        var mfopap    = fy.MasterKPI?.MFOPAP ?? fy.MFOPAP;

        var officeContributions = items.Select(MapOfficeContribution).ToList();

        return new ConsolidatedKpiGroupDto
        {
            MFOPAPCode           = mfopap?.Code ?? string.Empty,
            MFOPAPName           = mfopap?.Name ?? string.Empty,
            MFOPAPType           = mfopap?.Type ?? string.Empty,
            PerformanceIndicator = fy.Name,
            KpiCode              = fy.Code,
            FunctionCategory     = fy.FunctionCategory,
            IsGAD                = fy.IsGAD,
            MeasurementUnit      = fy.MeasurementUnit,
            KpiTotalBudget       = officeContributions.Sum(o => o.AllottedBudget),
            OfficeContributions  = officeContributions
        };
    }

    private static OfficeContributionDto MapOfficeContribution(OPCRItemEntity item)
    {
        var fy        = item.KPIAssignment!.FYActiveKPI!;
        var isPercent = fy.MeasurementUnit
            .Equals("Percentage", StringComparison.OrdinalIgnoreCase);

        string Fmt(decimal v) => isPercent ? $"{v:N2}%" : $"{v:N2}";

        return new OfficeContributionDto
        {
            OfficeName     = item.KPIAssignment.Office?.Name ?? string.Empty,
            Activities     = item.OPCRActivities
                                 .Where(a => !a.IsDeleted)
                                 .Select(a => a.Name)
                                 .ToList(),
            Q1Target       = Fmt(item.Q1Target),
            Q2Target       = Fmt(item.Q2Target),
            Q3Target       = Fmt(item.Q3Target),
            Q4Target       = Fmt(item.Q4Target),
            TotalTarget    = Fmt(item.Q1Target + item.Q2Target + item.Q3Target + item.Q4Target),
            AllottedBudget = item.OPCRActivities
                                 .Where(a => !a.IsDeleted)
                                 .Sum(a => a.Budget)
        };
    }

    private static List<SignatoryDto> BuildSignatories() =>
    [
        new SignatoryDto { Label = "Consolidated by:",      Designation = "Planning Officer"          },
        new SignatoryDto { Label = "Recommending Approval:", Designation = "Chancellor / Vice President" },
        new SignatoryDto { Label = "Approved by:",           Designation = "President"                 }
    ];
}
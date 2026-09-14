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

        var rawQ1 = item.Q1Target != 0 ? item.Q1Target : (item.KPIAssignment?.AssignedTargetQ1 ?? 0m);
        var rawQ2 = item.Q2Target != 0 ? item.Q2Target : (item.KPIAssignment?.AssignedTargetQ2 ?? 0m);
        var rawQ3 = item.Q3Target != 0 ? item.Q3Target : (item.KPIAssignment?.AssignedTargetQ3 ?? 0m);
        var rawQ4 = item.Q4Target != 0 ? item.Q4Target : (item.KPIAssignment?.AssignedTargetQ4 ?? 0m);
        var behavior = fy.DistributionBehavior?.Trim() ?? string.Empty;
        var isUniform = behavior.Equals("Uniform", StringComparison.OrdinalIgnoreCase) ||
                        behavior.Equals("Uniform/Average", StringComparison.OrdinalIgnoreCase);
        var isMax = behavior.Equals("Maximum", StringComparison.OrdinalIgnoreCase);
        var isMin = behavior.Equals("Minimum", StringComparison.OrdinalIgnoreCase);

        decimal rawTotal;
        if (isUniform)
        {
            rawTotal = (item.KPIAssignment?.AssignedTargetAnnual ?? 0m) != 0
                ? item.KPIAssignment!.AssignedTargetAnnual
                : (rawQ1 != 0 ? rawQ1 : (rawQ2 != 0 ? rawQ2 : (rawQ3 != 0 ? rawQ3 : rawQ4)));
        }
        else if (isMax)
        {
            rawTotal = Math.Max(Math.Max(rawQ1, rawQ2), Math.Max(rawQ3, rawQ4));
        }
        else if (isMin)
        {
            var nonZeros = new[] { rawQ1, rawQ2, rawQ3, rawQ4 }.Where(v => v > 0).ToList();
            rawTotal = nonZeros.Count > 0 ? nonZeros.Min() : 0m;
        }
        else
        {
            var sum = rawQ1 + rawQ2 + rawQ3 + rawQ4;
            rawTotal = sum != 0
                ? sum
                : (item.KPIAssignment?.AssignedTargetAnnual ?? 0m);
        }

        return new OfficeContributionDto
        {
            OfficeName     = item.KPIAssignment?.Office?.Name ?? string.Empty,
            Activities     = item.OPCRActivities
                                 .Where(a => !a.IsDeleted)
                                 .Select(a => a.Name)
                                 .ToList(),
            Q1Target       = Fmt(rawQ1),
            Q2Target       = Fmt(rawQ2),
            Q3Target       = Fmt(rawQ3),
            Q4Target       = Fmt(rawQ4),
            TotalTarget    = Fmt(rawTotal),
            AllottedBudget = item.OPCRActivities
                                 .Where(a => !a.IsDeleted)
                                 .Sum(a => a.Budget),
            Remarks        = item.Justification  // ✅ from OPCRItem.Justification
        };
    }

    private static List<SignatoryDto> BuildSignatories() =>
    [
        new SignatoryDto { Label = "Consolidated by:",      Designation = "Planning Officer"          },
        new SignatoryDto { Label = "Recommending Approval:", Designation = "Chancellor / Vice President" },
        new SignatoryDto { Label = "Approved by:",           Designation = "President"                 }
    ];
}
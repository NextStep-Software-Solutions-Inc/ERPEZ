// GenerateOpcrRatingDocumentCommandHandler.cs
using ERPEZ.Application.Interfaces.Services;
using ERPEZ.Application.Features.Planning.Document.Dtos;
using OPCREntity = ERPEZ.Domain.Entities.Planning.OPCR;
using ERPEZ.Application.Features.Planning.Document.Mappers;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Document.Commands.GenerateOPCRRating;

public class GenerateOpcrRatingDocumentCommandHandler(
    IUnitOfWork              unitOfWork,
    IDocumentRendererService rendererService,
    IDocumentStorageService  storageService)
    : IRequestHandler<GenerateOpcrRatingDocumentCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(
        GenerateOpcrRatingDocumentCommand request,
        CancellationToken                 cancellationToken)
    {
        // ── 1. Fetch OPCR with ratings ────────────────────────────────────────
        // The repository must eager-load:
        //   OPCRItems → OPCRItemRatings → KPIMeasurement → RatingScaleTemplate → RatingScaleLevels
        //   OPCRItems → OPCRActivities  → OPCRPAPDepartments
        //   OPCRItems → KPIAssignment   → FYActiveKPI → MFOPAP
        var opcr = await unitOfWork.OPCRRepository
            .GetOPCRWithRatingsAsync(request.OPCRId, cancellationToken)
            ?? throw new NotFoundException("OPCR not found.");

        // ── 2. Optionally scope to a specific evaluation ──────────────────────
        // If your OPCREvaluation entity gates which OPCRItemRatings are "active",
        // filter them here. For now we use all non-deleted ratings on each OPCRItem.
        // TODO: if EvaluationId is provided, filter OPCRItemRatings by evaluation scope.

        // ── 3. Map ───────────────────────────────────────────────────────────
        var dataDto = OpcrMapper.MapToBaseDto(opcr, includeRatings: true);

        // ── 4. Compute overall summary row ────────────────────────────────────
        AppendOverallSummary(dataDto);

        // ── 5. Render ────────────────────────────────────────────────────────
        var bytes = await rendererService.RenderAsync(
            dataDto, DocumentType.OpcrRating, request.Format, cancellationToken);

        // ── 6. Persist ───────────────────────────────────────────────────────
        var fileName = BuildFileName("OPCR_RATING", opcr, request.Format);
        var path     = await storageService.SaveAsync(bytes, fileName, cancellationToken);

        var record = new GeneratedDocument
        {
            DocumentType  = DocumentType.OpcrRating,
            Format        = request.Format,
            OfficeId      = opcr.OfficeId,
            StoragePath   = path,
            FileName      = fileName,
            FileSizeBytes = bytes.Length,
            FiscalYear    = opcr.FiscalYear?.Year.ToString() ?? string.Empty,
            GeneratedBy   = request.GeneratedBy
        };

        await unitOfWork.GeneratedDocumentRepository.AddAsync(record, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(record.Id, "OPCR Rating document generated successfully.");
    }

    /// <summary>
    /// Appends a synthetic summary row at the end of each function category section
    /// showing the weighted/average PMT rating and overall adjectival rating.
    /// The summary row reuses a sentinel MFO group with an empty code.
    /// </summary>
    private static void AppendOverallSummary(OpcrDataDto dto)
    {
        foreach (var category in dto.FunctionCategories)
        {
            var allRows = category.MFOGroups
                .SelectMany(g => g.KpiRows)
                .Where(r => r.AveRating.HasValue)
                .ToList();

            if (allRows.Count == 0) continue;

            var categoryAverage = Math.Round(allRows.Average(r => r.AveRating!.Value), 2);

            // Derive overall adjectival from first available scale template
            // (all KPIs in an office should share the same template)
            var adjectival = allRows
                .Select(r => r.AdjectivalRating)
                .FirstOrDefault(a => !string.IsNullOrWhiteSpace(a))
                ?? string.Empty;

            var summaryRow = new OpcrKpiRowDto
            {
                PerformanceIndicator = $"Overall {category.CategoryName} Rating",
                AveRating            = categoryAverage,
                AdjectivalRating     = adjectival
            };

            // Insert as its own sentinel group so the renderer can style it differently
            category.MFOGroups.Add(new OpcrMFOGroupDto
            {
                MFOCode  = "__SUMMARY__",
                MFOName  = string.Empty,
                KpiRows  = [summaryRow]
            });
        }
    }

    private static string BuildFileName(string prefix, OPCREntity opcr, ExportFormat format)
    {
        var ext = format == ExportFormat.Excel ? "xlsx" : "pdf";
        return $"{prefix}_{opcr.Code}_{DateTime.UtcNow:yyyyMMddHHmmss}.{ext}";
    }
}
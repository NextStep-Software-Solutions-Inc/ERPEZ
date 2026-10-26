using ERPEZ.Application.Common.Helpers;
using ERPEZ.Application.Interfaces.Services;
using ERPEZ.Application.Features.Planning.Document.Dtos;
using ERPEZ.Application.Features.Planning.Document.Mappers;
using OPCREntity = ERPEZ.Domain.Entities.Planning.OPCR;
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
        // ── 1. Fetch ────────────────────────────────────────────────────────
        var opcr = await unitOfWork.OPCRRepository
            .GetOPCRWithRatingsAsync(request.OPCRId, cancellationToken)
            ?? throw new NotFoundException("OPCR not found.");

        // ── 2. Map ──────────────────────────────────────────────────────────
        var wf = await DocumentSignatoryResolver
            .ResolveWorkflowApproversAsync(unitOfWork, opcr.OfficeId, opcr.FiscalYearId, "OPCR", cancellationToken);
        var pmt = await DocumentSignatoryResolver
            .ResolvePmtSignatoriesAsync(unitOfWork, opcr.FiscalYear?.Year, cancellationToken);
        var officeHead = await DocumentSignatoryResolver
            .ResolveOfficeHeadSignatoryAsync(unitOfWork, opcr.OfficeId, cancellationToken);
        var dataDto = OpcrMapper.MapToBaseDto(opcr, includeRatings: true, workflowApprovers: wf, pmtSignatories: pmt, officeHead: officeHead);

        // ── 3. Populate legend from GeneralRatingScale for this fiscal year ───
        if (unitOfWork.GeneralRatingScaleRepository != null)
        {
            var generalScales = await unitOfWork.GeneralRatingScaleRepository.GetListAsync(
                unitOfWork.GeneralRatingScaleRepository
                    .Query(g => g.FiscalYearId == opcr.FiscalYearId)
                    .OrderByDescending(g => g.MinScore)
                    .Select(g => new { g.AdjectivalRatingName, g.MinScore, g.MaxScore }),
                cancellationToken);

            dataDto.RatingScaleLegend = (generalScales ?? [])
                .Select(g => $"{g.MinScore:N2}–{g.MaxScore:N2} — {g.AdjectivalRatingName}")
                .ToList();
        }

        // ── 4. Compute overall summary row ─────────────────────────────────
        AppendOverallSummary(dataDto);

        // ── 5. Render ───────────────────────────────────────────────────────
        var bytes = await rendererService.RenderAsync(
            dataDto, DocumentType.OpcrRating, request.Format, cancellationToken);

        // ── 6. Persist ──────────────────────────────────────────────────────
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

            category.MFOGroups.Add(new OpcrMFOGroupDto
            {
                MFOCode = "__SUMMARY__",
                MFOName = string.Empty,
                KpiRows = [summaryRow]
            });
        }
    }

    private static string BuildFileName(string prefix, OPCREntity opcr, ExportFormat format)
    {
        var ext = format == ExportFormat.Excel ? "xlsx" : "pdf";
        return $"{prefix}_{opcr.Code}_{DateTime.UtcNow:yyyyMMddHHmmss}.{ext}";
    }
}
// OpcrRatingPdfRenderer.cs — OPCR With Ratings only
using ERPEZ.Application.Features.Planning.Document.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Infrastructure.Services.DocumentGeneration;
using ERPEZ.Infrastructure.Services.Renderers.Pdf.Base;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace ERPEZ.Infrastructure.Services.Renderers.Pdf;

internal sealed class OpcrRatingPdfRenderer : BasePdfRenderer, IDocumentRenderer<OpcrDataDto>
{
    public DocumentType DocumentType => DocumentType.OpcrRating;
    public ExportFormat Format       => ExportFormat.Pdf;

    public Task<byte[]> RenderAsync(
        OpcrDataDto       request,
        CancellationToken cancellationToken = default)
    {
        var pdf = Document.Create(doc =>
        {
            doc.Page(page =>
            {
                page.Size(PageSizes.Legal.Landscape());
                page.Margin(1.5f, Unit.Centimetre);
                page.DefaultTextStyle(t => t.FontSize(7).FontFamily("Arial"));

                // ── Header ────────────────────────────────────────────────
                page.Header().Column(h =>
                {
                    RenderAgencyHeader(
                        h,
                        request.ProcuringEntityName ?? request.AgencyName,
                        request.ProcuringEntityAddress,
                        request.LogoBytes,
                        appendixText: null,
                        documentTitle: "OFFICE PERFORMANCE COMMITMENT AND REVIEW (OPCR)",
                        documentSubtitle: $"FY {request.FiscalYear}",
                        showUnderline: true,
                        titleFontSize: 10f,
                        alignment: request.LetterheadAlignment);

                    // Declaration statement (ratings variant differs from proposed)
                    h.Item().PaddingTop(6).Text(t =>
                    {
                        t.Span("I, ").FontSize(8);
                        t.Span(request.CommitmentPersonName).Bold().FontSize(8);
                        t.Span($", of {request.OfficeName}, hereby declare that I have attained " +
                               $"the following targets in accordance with the indicated measures for ")
                            .FontSize(8);
                        t.Span(request.PeriodCovered).Bold().FontSize(8);
                    });

                    // Rating scale legend in header (matches the sample PDF layout)
                    h.Item().PaddingTop(6).Row(r =>
                    {
                        r.RelativeItem().Column(sig =>
                        {
                            sig.Item().PaddingTop(12).MaxWidth(180).BorderBottom(1).BorderColor(Colors.Black).PaddingBottom(2)
                                .Text(request.CommitmentPersonName).Bold().FontSize(8);
                            sig.Item().PaddingTop(2).Text(string.IsNullOrWhiteSpace(request.CommitmentPersonPosition) ? "Head/Focal Person, Delivery Unit" : request.CommitmentPersonPosition).FontSize(7);
                            sig.Item().Text("Date:").FontSize(7);
                        });

                        r.RelativeItem().Column(legend =>
                        {
                            // legend.Item().Text("5 - Outstanding").FontSize(7);
                            // legend.Item().Text("4 - Very Satisfactory").FontSize(7);
                            // legend.Item().Text("3 - Satisfactory").FontSize(7);
                            // legend.Item().Text("2 - Unsatisfactory").FontSize(7);
                            // legend.Item().Text("1 - Poor").FontSize(7);

                            foreach (var entry in request.RatingScaleLegend)
                                legend.Item().Text(entry).FontSize(7);
                        });
                    });
                });
    
                // ── Content ───────────────────────────────────────────────
                page.Content().PaddingTop(8).Column(col =>
                {
                    col.Item().Table(table =>
                    {
                        // 18 columns
                        table.ColumnsDefinition(c =>
                        {
                            c.RelativeColumn(1.5f); // SDA/PREXC
                            c.RelativeColumn(3f);   // KPI
                            c.RelativeColumn(1f);   // Annual Target
                            c.RelativeColumn(2f);   // Actual Accomplishment
                            c.RelativeColumn(0.8f); // Q
                            c.RelativeColumn(0.8f); // E
                            c.RelativeColumn(0.8f); // T
                            c.RelativeColumn(0.8f); // Ave
                            c.RelativeColumn(2f);   // MOV
                            c.RelativeColumn(2.5f); // Remarks/Justification
                        });

                        table.Header(h =>
                        {
                            void HCell(string text) =>
                                h.Cell().Element(TableHeaderCell).AlignCenter().AlignMiddle()
                                    .Text(text).Bold().FontSize(6);

                            HCell("SDA/Goals/\nPREXC");
                            HCell("KPI");
                            HCell("Annual\nTarget");
                            HCell("Actual\nAccomplishment");

                            // Rating sub-header group
                            HCell("Q");
                            HCell("E");
                            HCell("T");
                            HCell("Ave");

                            HCell("Mode of\nVerification");
                            HCell("Remarks/Justification\n(Use separate sheet if necessary)");
                        });

                        RenderRatingTableBody(table, request);
                    });

                    // Overall summary per function category
                    RenderFinalRatingSummary(col, request);

                    col.Item().PaddingTop(6)
                        .Text("Legend: Q - Quantity, E - Efficiency, T - Timeliness, Ave - Average")
                        .FontSize(7).Italic();

                    RenderSignatories(col, request.Signatories);
                });

                page.Footer().AlignRight().Text(t =>
                {
                    t.Span("Page ").FontSize(7);
                    t.CurrentPageNumber().FontSize(7);
                    t.Span(" of ").FontSize(7);
                    t.TotalPages().FontSize(7);
                });
            });
        }).GeneratePdf();

        return Task.FromResult(pdf);
    }

    private static void RenderRatingTableBody(TableDescriptor table, OpcrDataDto dto)
    {
        const uint colCount = 10;

        foreach (var category in dto.FunctionCategories)
        {
            // Skip summary sentinel groups in the main table — rendered separately below
            var realGroups = category.MFOGroups
                .Where(g => g.MFOCode != "__SUMMARY__")
                .ToList();

            if (realGroups.Count == 0) continue;

            table.Cell().ColumnSpan(colCount)
                .Element(c => c.Background(Colors.Grey.Lighten1).Padding(3))
                .Text(category.CategoryName).Bold().FontSize(7);

            foreach (var mfoGroup in realGroups)
            {
                if (!string.IsNullOrWhiteSpace(mfoGroup.MFOName))
                {
                    table.Cell().ColumnSpan(colCount)
                        .Element(c => c.Background(Colors.Grey.Lighten2).Padding(3))
                        .Text($"{mfoGroup.MFOCode} — {mfoGroup.MFOName}")
                        .Bold().FontSize(7);
                }

                foreach (var kpi in mfoGroup.KpiRows)
                {
                    table.Cell().Element(TableDataCell).Text(kpi.SDAGoalsPREXC).FontSize(7);
                    table.Cell().Element(TableDataCell).Text(kpi.PerformanceIndicator).FontSize(7);
                    table.Cell().Element(TableDataCell).AlignCenter().Text(kpi.TotalTarget).FontSize(7);
                    table.Cell().Element(TableDataCell).Text(kpi.ActualAccomplishment ?? string.Empty).FontSize(7);
                    table.Cell().Element(TableDataCell).AlignCenter()
                        .Text(kpi.QRating?.ToString("N2") ?? string.Empty).FontSize(7);
                    table.Cell().Element(TableDataCell).AlignCenter()
                        .Text(kpi.ERating?.ToString("N2") ?? string.Empty).FontSize(7);
                    table.Cell().Element(TableDataCell).AlignCenter()
                        .Text(kpi.TRating?.ToString("N2") ?? string.Empty).FontSize(7);
                    table.Cell().Element(TableDataCell).AlignCenter()
                        .Text(kpi.AveRating?.ToString("N2") ?? string.Empty).FontSize(7);
                    // MOV — render requirement names, one per line
                    table.Cell().Element(TableDataCell).Column(c =>
                    {
                        if (kpi.MOVRequirements.Count == 0)
                        {
                            c.Item().Text(string.Empty).FontSize(7);
                        }
                        else
                        {
                            foreach (var mov in kpi.MOVRequirements)
                                c.Item().Text($"• {mov}").FontSize(7);
                        }
                    });
                    table.Cell().Element(TableDataCell).Text(kpi.PMTRemark ?? string.Empty).FontSize(7);
                }
            }
        }
    }

    /// <summary>
    /// Renders the II. Core Functions / III. Mandatory Support Functions / FINAL RATING
    /// summary block that appears below the main table in the rating PDF.
    /// </summary>
    private static void RenderFinalRatingSummary(ColumnDescriptor col, OpcrDataDto dto)
    {
        col.Item().PaddingTop(12).Table(summary =>
        {
            summary.ColumnsDefinition(c =>
            {
                c.RelativeColumn(6f); // Label
                c.RelativeColumn(1f); // Ave score
            });

            foreach (var category in dto.FunctionCategories)
            {
                var sentinelGroup = category.MFOGroups
                    .FirstOrDefault(g => g.MFOCode == "__SUMMARY__");

                if (sentinelGroup is null) continue;

                var row = sentinelGroup.KpiRows.First();

                summary.Cell().Element(TableDataCell)
                    .Text(row.PerformanceIndicator).Bold().FontSize(7);
                summary.Cell().Element(TableDataCell).AlignCenter()
                    .Text(row.AveRating?.ToString("N2") ?? string.Empty).Bold().FontSize(7);
            }

            // FINAL RATING row
            var allAverages = dto.FunctionCategories
                .SelectMany(c => c.MFOGroups.Where(g => g.MFOCode == "__SUMMARY__"))
                .SelectMany(g => g.KpiRows)
                .Where(r => r.AveRating.HasValue)
                .Select(r => r.AveRating!.Value)
                .ToList();

            var finalRating = allAverages.Count > 0
                ? Math.Round(allAverages.Average(), 2)
                : (decimal?)null;

            summary.Cell().Element(c => c.Background(Colors.Grey.Lighten2).Padding(3))
                .Text("FINAL RATING").Bold().FontSize(7);
            summary.Cell().Element(c => c.Background(Colors.Grey.Lighten2).Padding(3)).AlignCenter()
                .Text(finalRating?.ToString("N2") ?? string.Empty).Bold().FontSize(7);
        });
    }
}
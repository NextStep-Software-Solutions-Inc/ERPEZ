// ConsolidatedOpcrPdfRenderer.cs
using ERPEZ.Application.Features.Planning.Document.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Infrastructure.Services.DocumentGeneration;
using ERPEZ.Infrastructure.Services.Renderers.Pdf.Base;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace ERPEZ.Infrastructure.Services.Renderers.Pdf;

internal sealed class ConsolidatedOpcrPdfRenderer
    : BasePdfRenderer, IDocumentRenderer<ConsolidatedOpcrDataDto>
{
    public DocumentType DocumentType => DocumentType.ConsolidatedOpcr;
    public ExportFormat Format       => ExportFormat.Pdf;

    public Task<byte[]> RenderAsync(
        ConsolidatedOpcrDataDto request,
        CancellationToken       cancellationToken = default)
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
                    h.Item().AlignCenter()
                        .Text("CONSOLIDATED OFFICE PERFORMANCE COMMITMENT AND REVIEW")
                        .Bold().FontSize(11);

                    h.Item().PaddingTop(2).AlignCenter()
                        .Text($"{request.AgencyName}").FontSize(9);

                    h.Item().PaddingTop(2).AlignCenter()
                        .Text($"Fiscal Year {request.FiscalYear}" +
                              (string.IsNullOrWhiteSpace(request.RatingPeriod)
                                  ? string.Empty
                                  : $" | {request.RatingPeriod}"))
                        .FontSize(8);
                });

                // ── Content ───────────────────────────────────────────────
                page.Content().PaddingTop(8).Column(col =>
                {
                    col.Item().Table(table =>
                    {
                        // 8 columns
                        table.ColumnsDefinition(c =>
                        {
                            c.RelativeColumn(3f);   // Contributing Office
                            c.RelativeColumn(4f);   // Activities
                            c.RelativeColumn(1f);   // Q1
                            c.RelativeColumn(1f);   // Q2
                            c.RelativeColumn(1f);   // Q3
                            c.RelativeColumn(1f);   // Q4
                            c.RelativeColumn(1f);   // Total
                            c.RelativeColumn(1.8f); // Budget
                            c.RelativeColumn(2f);   // Remarks ✅ Add
                        });

                        RenderTableBody(table, request);
                    });

                    // ── Total budget ──────────────────────────────────────
                    col.Item().PaddingTop(6).AlignRight()
                        .Text($"TOTAL CONSOLIDATED BUDGET: ₱{request.TotalBudget:N2}")
                        .Bold().FontSize(9);

                    RenderSignatories(col, request.Signatories);
                });

                // ── Footer ─────────────────────────────────────────────────
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

    private static void RenderTableBody(
        TableDescriptor table, ConsolidatedOpcrDataDto dto)
    {
        const uint colCount = 9;  // 8 columns + 1 for Remarks

        string? currentCategory = null;

        foreach (var kpi in dto.KpiGroups)
        {
            // ── Function category section header ─────────────────────────
            if (kpi.FunctionCategory != currentCategory)
            {
                currentCategory = kpi.FunctionCategory;
                var catLabel = kpi.FunctionCategory switch
                {
                    "Strategic" => "I. Strategic Priority & Core Function",
                    "Core"      => "II. Core Functions",
                    "Mandatory" => "III. Mandatory Support Functions",
                    _           => kpi.FunctionCategory
                };

                table.Cell().ColumnSpan(colCount)
                    .Element(c => c
                        .Background(Colors.Grey.Darken1)
                        .Padding(4))
                    .Text(catLabel)
                    .Bold().FontSize(8).FontColor(Colors.White);
            }

            // ── MFOPAP sub-header ────────────────────────────────────────
            if (!string.IsNullOrWhiteSpace(kpi.MFOPAPCode))
            {
                table.Cell().ColumnSpan(colCount)
                    .Element(c => c
                        .Background(Colors.Grey.Lighten2)
                        .Padding(3)
                        .PaddingLeft(8))
                    .Text($"{kpi.MFOPAPCode} — {kpi.MFOPAPName} ({kpi.MFOPAPType})")
                    .Bold().FontSize(7);
            }

            // ── KPI header row ───────────────────────────────────────────
            table.Cell().ColumnSpan(colCount)
                .Element(c => c
                    .Background(Colors.Grey.Lighten3)
                    .Border(1)
                    .BorderColor(Colors.Grey.Medium)
                    .Padding(3)
                    .PaddingLeft(12))
                .Column(kpiHeader =>
                {
                    kpiHeader.Item().Text(t =>
                    {
                        t.Span($"[{kpi.KpiCode}] ").Bold().FontSize(7);
                        t.Span(kpi.PerformanceIndicator).Bold().FontSize(7);
                        if (kpi.IsGAD)
                            t.Span("  [GAD]").FontSize(6).FontColor(Colors.Green.Darken2);
                    });
                });

            // ── Column headers per KPI ───────────────────────────────────
            void HCell(string text) =>
                table.Cell().Element(TableHeaderCell)
                    .AlignCenter().AlignMiddle()
                    .Text(text).Bold().FontSize(6);

            HCell("Contributing\nOffice");
            HCell("Activities");
            HCell("Q1");
            HCell("Q2");
            HCell("Q3");
            HCell("Q4");
            HCell("Total");
            HCell("Allotted\nBudget (₱)");
            HCell("Remarks");  // ✅ Add

            // ── Office contribution rows ──────────────────────────────────
            foreach (var office in kpi.OfficeContributions)
            {
                table.Cell().Element(TableDataCell)
                    .Text(office.OfficeName).FontSize(7);

                // Activities — bulleted list
                table.Cell().Element(TableDataCell).Column(acts =>
                {
                    if (office.Activities.Count == 0)
                    {
                        acts.Item().Text(string.Empty).FontSize(7);
                    }
                    else
                    {
                        foreach (var act in office.Activities)
                            acts.Item().Text($"• {act}").FontSize(7);
                    }
                });

                table.Cell().Element(TableDataCell)
                    .AlignCenter().Text(office.Q1Target).FontSize(7);
                table.Cell().Element(TableDataCell)
                    .AlignCenter().Text(office.Q2Target).FontSize(7);
                table.Cell().Element(TableDataCell)
                    .AlignCenter().Text(office.Q3Target).FontSize(7);
                table.Cell().Element(TableDataCell)
                    .AlignCenter().Text(office.Q4Target).FontSize(7);
                table.Cell().Element(TableDataCell)
                    .AlignCenter().Text(office.TotalTarget).FontSize(7);
                table.Cell().Element(TableDataCell)
                    .AlignRight()
                    .Text($"₱{office.AllottedBudget:N2}").FontSize(7);
                table.Cell().Element(TableDataCell)
                    .Text(office.Remarks ?? string.Empty).FontSize(7);
            }

            // ── KPI subtotal row ─────────────────────────────────────────
            table.Cell().ColumnSpan(colCount - 1)
                .Element(c => c
                    .Border(1)
                    .BorderColor(Colors.Grey.Medium)
                    .Background(Colors.Grey.Lighten4)
                    .Padding(3))
                .AlignRight()
                .Text($"KPI Total:").Bold().FontSize(7);

            table.Cell()
                .Element(c => c
                    .Border(1)
                    .BorderColor(Colors.Grey.Medium)
                    .Background(Colors.Grey.Lighten4)
                    .Padding(3))
                .AlignRight()
                .Text($"₱{kpi.KpiTotalBudget:N2}").Bold().FontSize(7);
        }
    }
}
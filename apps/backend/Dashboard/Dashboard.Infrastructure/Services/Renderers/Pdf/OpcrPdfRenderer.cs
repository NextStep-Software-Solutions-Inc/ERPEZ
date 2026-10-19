// OpcrPdfRenderer.cs — Proposed OPCR only
using ERPEZ.Application.Features.Planning.Document.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Infrastructure.Services.DocumentGeneration;
using ERPEZ.Infrastructure.Services.Renderers.Pdf.Base;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace ERPEZ.Infrastructure.Services.Renderers.Pdf;

internal sealed class OpcrPdfRenderer : BasePdfRenderer, IDocumentRenderer<OpcrDataDto>
{
    public DocumentType DocumentType => DocumentType.Opcr;
    public ExportFormat Format       => ExportFormat.Pdf;

    public Task<byte[]> RenderAsync(
        OpcrDataDto       request,
        CancellationToken cancellationToken = default)
    {
        var pdf = Document.Create(doc =>
        {
            doc.Page(page =>
            {
                page.Size(PageSizes.A4.Landscape());
                page.Margin(1.5f, Unit.Centimetre);
                page.DefaultTextStyle(t => t.FontSize(7).FontFamily("Arial"));

                // ── Header ────────────────────────────────────────────────
                page.Header().Column(h =>
                {
                    h.Item().AlignCenter()
                        .Text("OFFICE PERFORMANCE COMMITMENT AND REVIEW (OPCR)")
                        .Bold().FontSize(10);

                    h.Item().PaddingTop(4).AlignCenter()
                        .Text($"Proposed {request.OfficeName} OPCR FY {request.FiscalYear}")
                        .FontSize(8);

                    // Commitment statement
                    h.Item().PaddingTop(6).Text(t =>
                    {
                        t.Span("I, ").FontSize(8);
                        t.Span(request.CommitmentPersonName).Bold().FontSize(8);
                        t.Span($", of {request.OfficeName} commit to deliver and attain the " +
                               $"following targets in accordance with the indicated measures for " +
                               $"the period {request.PeriodCovered}").FontSize(8);
                    });

                    h.Item().PaddingTop(14).MaxWidth(180).BorderBottom(1).BorderColor(Colors.Black).PaddingBottom(2)
                        .Text(request.CommitmentPersonName).Bold().FontSize(8);
                    h.Item().PaddingTop(2).Text(request.CommitmentPersonPosition).FontSize(7).Italic();
                });

                // ── Content ───────────────────────────────────────────────
                page.Content().PaddingTop(8).Column(col =>
                {
                    col.Item().Table(table =>
                    {
                        // 11 columns
                        table.ColumnsDefinition(c =>
                        {
                            c.RelativeColumn(1.5f); // SDA/PREXC
                            c.RelativeColumn(2f);   // GAD
                            c.RelativeColumn(3f);   // KPI
                            c.RelativeColumn(1f);   // Q1
                            c.RelativeColumn(1f);   // Q2
                            c.RelativeColumn(1f);   // Q3
                            c.RelativeColumn(1f);   // Q4
                            c.RelativeColumn(1f);   // Total
                            c.RelativeColumn(2.5f); // API
                            c.RelativeColumn(1.5f); // Budget
                            c.RelativeColumn(2f);   // Departments
                        });

                        table.Header(h =>
                        {
                            void HCell(string text) =>
                                h.Cell().Element(TableHeaderCell).AlignCenter().AlignMiddle()
                                    .Text(text).Bold().FontSize(6);

                            HCell("SDA/Goals/\nPREXC");
                            HCell("GAD Mainstreaming\nMeasures and Targets");
                            HCell("Success Indicators / KPI");
                            HCell("1st");
                            HCell("2nd");
                            HCell("3rd");
                            HCell("4th");
                            HCell("Total");
                            HCell("API\n(Activity/Project/\nInitiative)");
                            HCell("Alloted\nBudget*");
                            HCell("Division/\nUnits/\nDept.");
                        });

                        RenderTableBody(table, request, includeRatings: false);
                    });

                    col.Item().PaddingTop(4).AlignRight()
                        .Text($"TOTAL: ₱{request.TotalBudget:N2}").Bold().FontSize(8);

                    col.Item().PaddingTop(4)
                        .Text("* With the approval of the President (Supplemental Budget)")
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

    private static void RenderTableBody(TableDescriptor table, OpcrDataDto dto, bool includeRatings)
    {
        const uint colCount = 11;

        foreach (var category in dto.FunctionCategories)
        {
            table.Cell().ColumnSpan(colCount)
                .Element(c => c.Background(Colors.Grey.Lighten1).Padding(3))
                .Text($"{category.CategoryName}" +
                      (category.Percentage > 0 ? $" ({category.Percentage:N2}%)" : string.Empty))
                .Bold().FontSize(7);

            foreach (var mfoGroup in category.MFOGroups)
            {
                if (!string.IsNullOrWhiteSpace(mfoGroup.MFOName))
                {
                    table.Cell().ColumnSpan(colCount)
                        .Element(c => c.Background(Colors.Grey.Lighten2).Padding(3))
                        .Text($"{mfoGroup.MFOCode} — {mfoGroup.MFOName} ({mfoGroup.MFOType})")
                        .Bold().FontSize(7);
                }

                foreach (var kpi in mfoGroup.KpiRows)
                {
                    table.Cell().Element(TableDataCell).Text(kpi.SDAGoalsPREXC).FontSize(7);
                    table.Cell().Element(TableDataCell).Text(kpi.GadMeasure ?? string.Empty).FontSize(7);
                    table.Cell().Element(TableDataCell).Text(kpi.PerformanceIndicator).FontSize(7);
                    table.Cell().Element(TableDataCell).AlignCenter().Text(kpi.Q1Target).FontSize(7);
                    table.Cell().Element(TableDataCell).AlignCenter().Text(kpi.Q2Target).FontSize(7);
                    table.Cell().Element(TableDataCell).AlignCenter().Text(kpi.Q3Target).FontSize(7);
                    table.Cell().Element(TableDataCell).AlignCenter().Text(kpi.Q4Target).FontSize(7);
                    table.Cell().Element(TableDataCell).AlignCenter().Text(kpi.TotalTarget).FontSize(7);

                    var first = kpi.Activities.FirstOrDefault();
                    table.Cell().Element(TableDataCell).Text(first?.ActivityName ?? string.Empty).FontSize(7);
                    table.Cell().Element(TableDataCell).AlignRight()
                        .Text(first is not null ? $"₱{first.Budget:N2}" : string.Empty).FontSize(7);
                    table.Cell().Element(TableDataCell).Text(first?.Departments ?? string.Empty).FontSize(7);

                    foreach (var activity in kpi.Activities.Skip(1))
                    {
                        for (var i = 0; i < 8; i++)
                            table.Cell().Element(TableDataCell).Text(string.Empty).FontSize(7);
                        table.Cell().Element(TableDataCell).Text(activity.ActivityName).FontSize(7);
                        table.Cell().Element(TableDataCell).AlignRight()
                            .Text($"₱{activity.Budget:N2}").FontSize(7);
                        table.Cell().Element(TableDataCell).Text(activity.Departments).FontSize(7);
                    }
                }
            }
        }
    }
}
using ERPEZ.Application.Common.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Infrastructure.Services.DocumentGeneration;
using ERPEZ.Infrastructure.Services.Renderers.Pdf.Base;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace ERPEZ.Infrastructure.Services.Renderers.Pdf;

internal sealed class AppPdfRenderer : BasePdfRenderer, IDocumentRenderer<AppDataDto>
{
    public DocumentType DocumentType => DocumentType.App;
    public ExportFormat Format       => ExportFormat.Pdf;

    public Task<byte[]> RenderAsync(
        AppDataDto request,
        CancellationToken cancellationToken = default)
    {
        var pdf = Document.Create(doc =>
        {
            doc.Page(page =>
            {
                // A3 landscape gives enough width for 12 columns at readable size.
                page.Size(PageSizes.A3.Landscape());
                page.Margin(1.5f, Unit.Centimetre);
                page.DefaultTextStyle(t => t.FontSize(7).FontFamily("Arial"));

                // ── Page Header ────────────────────────────────────────────
                page.Header().Column(h =>
                {
                    h.Item().AlignCenter().Text("[Agency Letterhead with Logo]")
                        .Bold().FontSize(9).Italic();

                    h.Item().PaddingTop(4).AlignCenter()
                        .Text($"ANNUAL PROCUREMENT PLAN FOR FY {request.FiscalYear}")
                        .Bold().FontSize(11);

                    var indicativeBox = request.IsIndicative ? "☑" : "☐";
                    var finalBox      = request.IsFinal ? "☑" : "☐";
                    var updatedBox    = request.IsUpdated ? "☑" : "☐";
                    var versionStr    = request.IsUpdated && !string.IsNullOrWhiteSpace(request.VersionNumber)
                        ? $" (Ver. {request.VersionNumber}{(string.IsNullOrWhiteSpace(request.VersionDate) ? "" : " - " + request.VersionDate)})"
                        : string.Empty;

                    var batchQuarterStr = (!string.IsNullOrWhiteSpace(request.Batch) || !string.IsNullOrWhiteSpace(request.Quarter))
                        ? $" | {request.Batch} ({request.Quarter})"
                        : string.Empty;

                    h.Item().PaddingTop(3).AlignCenter()
                        .Text($"{indicativeBox} INDICATIVE     {finalBox} FINAL     {updatedBox} UPDATED{versionStr}{batchQuarterStr}")
                        .FontSize(9);
                });

                // ── Content ────────────────────────────────────────────────
                page.Content().PaddingTop(8).Column(col =>
                {
                    col.Item().Table(table =>
                    {
                        // 12 columns definitions
                        table.ColumnsDefinition(c =>
                        {
                            c.RelativeColumn(2.2f); // Col 1: Project Title
                            c.RelativeColumn(2f);   // Col 2: End-User or Implementing Unit
                            c.RelativeColumn(3f);   // Col 3: General Description
                            c.RelativeColumn(2f);   // Col 4: Mode of Procurement
                            c.RelativeColumn(1f);   // Col 5: Early Procurement Activity? (Yes/No)
                            c.RelativeColumn(2.5f); // Col 6: Criteria for Bid Evaluation
                            c.RelativeColumn(1.2f); // Col 7: Start of Procurement (MM/YYYY)
                            c.RelativeColumn(1.2f); // Col 8: End of Procurement (MM/YYYY)
                            c.RelativeColumn(1.4f); // Col 9: Source of Fund
                            c.RelativeColumn(1.8f); // Col 10: Estimated Budget (PhP)
                            c.RelativeColumn(2f);   // Col 11: Procurement Strategy or Tools
                            c.RelativeColumn(1.7f); // Col 12: Remarks
                        });

                        table.Header(h =>
                        {
                            // ── Row 0: Group headers ────────────
                            h.Cell().ColumnSpan(6).Element(TableHeaderCell).Text("PROCUREMENT PROJECT DETAILS").Bold().FontSize(7);
                            h.Cell().ColumnSpan(2).Element(TableHeaderCell).Text("PROJECTED TIMELINE (MM/YYYY)").Bold().FontSize(7);
                            h.Cell().ColumnSpan(2).Element(TableHeaderCell).Text("FUNDING DETAILS").Bold().FontSize(7);
                            h.Cell().RowSpan(2).Element(TableHeaderCell).Text("PROCUREMENT STRATEGY\nOR TOOLS").Bold().FontSize(7); // ← spans 2 rows
                            h.Cell().RowSpan(2).Element(TableHeaderCell).Text("REMARKS\n(Other relevant descriptions of the\nprocurement project, if applicable)").Bold().FontSize(7); // ← spans 2 rows

                            // ── Row 1: Column headers (10 cells only, not 12) ────────────
                            h.Cell().Element(TableHeaderCell).Text("Project Title").Bold().FontSize(7);
                            h.Cell().Element(TableHeaderCell).Text("End-User or\nImplementing Unit").Bold().FontSize(7);
                            h.Cell().Element(TableHeaderCell).Text("General Description of the Project").Bold().FontSize(7);
                            h.Cell().Element(TableHeaderCell).Text("Mode of Procurement").Bold().FontSize(7);
                            h.Cell().Element(TableHeaderCell).Text("To be covered by an Early\nProcurement Activity? (Yes/No)").Bold().FontSize(7);
                            h.Cell().Element(TableHeaderCell).Text("Criteria for Bid Evaluation\n(Including Sustainability and\nDomestic Preference)").Bold().FontSize(7);
                            h.Cell().Element(TableHeaderCell).Text("Start of Procurement\nActivity (MM/YYYY)").Bold().FontSize(7);
                            h.Cell().Element(TableHeaderCell).Text("End of Procurement\nActivity (MM/YYYY)").Bold().FontSize(7);
                            h.Cell().Element(TableHeaderCell).Text("Source of Fund").Bold().FontSize(7);
                            h.Cell().Element(TableHeaderCell).Text("Estimated Budget /\nApproved Budget for the\nContract (PhP)").Bold().FontSize(7);
                            // ← No cells for Col 11 and 12 here — covered by RowSpan(2) above

                            // ── Row 2: Column numbers ────
                            for (var i = 1; i <= 12; i++)
                                h.Cell().Element(TableHeaderCell).Text($"Column {i}").Italic().FontSize(6);
                        });

                        // Render sections
                        RenderSection(table, "General Requirements", request.GeneralRequirements);
                        RenderSection(table, "Common Use Supplies and Equipment (CSE) to be purchased from PS-DBM (kindly indicate the summary/total amounts only)", request.CommonUseSupplies);
                        RenderSection(table, "Miscellaneous Items Sec 32.2 of RA No. 12009", request.MiscellaneousItems);
                    });

                    // ── Footer Totals Block ───────────────────────────────────
                    col.Item().AlignRight().Width(350).PaddingTop(10).Border(0.5f).BorderColor(Colors.Grey.Medium).Padding(6).Column(sb =>
                    {
                        sb.Item().Row(r =>
                        {
                            r.RelativeItem().Text("Total Amount of Estimated Budget for EPA Projects:").FontSize(7);
                            r.ConstantItem(100).AlignRight().Text($"₱{request.TotalEpaProjects:N2}").Bold().FontSize(7);
                        });
                        sb.Item().PaddingTop(2).Row(r =>
                        {
                            r.RelativeItem().Text("Total Amount of CSEs to be purchased from PS-DBM:").FontSize(7);
                            r.ConstantItem(100).AlignRight().Text($"₱{request.TotalCsePsDbm:N2}").Bold().FontSize(7);
                        });
                        sb.Item().PaddingTop(2).Row(r =>
                        {
                            r.RelativeItem().Text("Total Amount of Estimated Budget:").FontSize(8).Bold();
                            r.ConstantItem(100).AlignRight().Text($"₱{request.TotalEstimatedBudget:N2}").Bold().FontSize(8);
                        });
                    });

                    // ── Signatories ───────────────────────────────────────────
                    RenderSignatories(col, request.Signatories);
                });

                // ── Page Number Footer ──────────────────────────────────────
                page.Footer().AlignRight()
                    .Text(t =>
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

    private static void RenderSection(TableDescriptor table, string sectionTitle, List<AppItemRowDto> items)
    {
        if (items == null || !items.Any()) return;

        table.Cell().ColumnSpan(12).Border(0.5f).BorderColor(Colors.Grey.Medium).Background(Colors.Grey.Lighten3).Padding(4)
            .Text(sectionTitle).Bold().FontSize(8);

        foreach (var item in items)
        {
            static IContainer CellStyle(IContainer container, bool center = false, bool right = false)
            {
                var c = container.Border(0.5f).BorderColor(Colors.Grey.Medium).Padding(3);
                if (center) c = c.AlignCenter();
                if (right) c = c.AlignRight();
                return c;
            }

            table.Cell().Element(c => CellStyle(c))
                .Text(item.ProjectTitle).FontSize(7);

            table.Cell().Element(c => CellStyle(c))
                .Text(item.EndUserOrImplementingUnit);

            table.Cell().Element(c => CellStyle(c))
                .Text(item.GeneralDescription);

            table.Cell().Element(c => CellStyle(c))
                .Text(item.ModeOfProcurement);

            table.Cell().Element(c => CellStyle(c, center: true))
                .Text(item.CoveredByEpa ? "Yes" : "No");

            table.Cell().Element(c => CellStyle(c))
                .Text(item.CriteriaForBidEvaluation);

            table.Cell().Element(c => CellStyle(c, center: true))
                .Text(item.StartOfProcurement);

            table.Cell().Element(c => CellStyle(c, center: true))
                .Text(item.EndOfProcurement);

            table.Cell().Element(c => CellStyle(c))
                .Text(item.SourceOfFund);

            table.Cell().Element(c => CellStyle(c, right: true))
                .Text($"₱{item.EstimatedBudget:N2}");

            table.Cell().Element(c => CellStyle(c))
                .Text(item.ProcurementStrategyOrTools);

            table.Cell().Element(c => CellStyle(c))
                .Text(item.Remarks);
        }
    }
}
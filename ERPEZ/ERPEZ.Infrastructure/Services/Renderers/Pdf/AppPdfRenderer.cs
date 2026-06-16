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

                    // Status checkboxes
                    var indicativeBox = request.IsIndicative ? "☑" : "☐";
                    var finalBox      = request.IsFinal ? "☑" : "☐";
                    var updatedBox    = request.IsUpdated ? "☑" : "☐";
                    var versionStr    = request.IsUpdated && !string.IsNullOrWhiteSpace(request.VersionNumber)
                        ? $" (Ver. {request.VersionNumber})"
                        : string.Empty;

                    h.Item().PaddingTop(3).AlignCenter()
                        .Text($"{indicativeBox} INDICATIVE     {finalBox} FINAL     {updatedBox} UPDATED{versionStr}")
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
                            // ── Row 1: Header names ────────────
                            h.Cell().Element(TableHeaderCell).AlignCenter().AlignMiddle()
                                .Text("Project Title").Bold().FontSize(7);
                            h.Cell().Element(TableHeaderCell).AlignCenter().AlignMiddle()
                                .Text("End-User or\nImplementing Unit").Bold().FontSize(7);
                            h.Cell().Element(TableHeaderCell).AlignCenter().AlignMiddle()
                                .Text("General Description of the Project").Bold().FontSize(7);
                            h.Cell().Element(TableHeaderCell).AlignCenter().AlignMiddle()
                                .Text("Mode of Procurement").Bold().FontSize(7);
                            h.Cell().Element(TableHeaderCell).AlignCenter().AlignMiddle()
                                .Text("To be covered by an Early\nProcurement Activity? (Yes/No)").Bold().FontSize(7);
                            h.Cell().Element(TableHeaderCell).AlignCenter().AlignMiddle()
                                .Text("Criteria for Bid Evaluation\n(Including Sustainability and\nDomestic Preference)").Bold().FontSize(7);
                            h.Cell().Element(TableHeaderCell).AlignCenter().AlignMiddle()
                                .Text("Start of Procurement\nActivity (MM/YYYY)").Bold().FontSize(7);
                            h.Cell().Element(TableHeaderCell).AlignCenter().AlignMiddle()
                                .Text("End of Procurement\nActivity (MM/YYYY)").Bold().FontSize(7);
                            h.Cell().Element(TableHeaderCell).AlignCenter().AlignMiddle()
                                .Text("Source of Fund").Bold().FontSize(7);
                            h.Cell().Element(TableHeaderCell).AlignCenter().AlignMiddle()
                                .Text("Estimated Budget /\nApproved Budget for the\nContract (PhP)").Bold().FontSize(7);
                            h.Cell().Element(TableHeaderCell).AlignCenter().AlignMiddle()
                                .Text("PROCUREMENT STRATEGY\nOR TOOLS").Bold().FontSize(7);
                            h.Cell().Element(TableHeaderCell).AlignCenter().AlignMiddle()
                                .Text("REMARKS").Bold().FontSize(7);

                            // ── Row 2: Column numbers ────
                            for (var i = 1; i <= 12; i++)
                                h.Cell().Element(TableHeaderCell).AlignCenter()
                                    .Text($"Column {i}").Italic().FontSize(6);
                        });

                        // Render sections
                        RenderSection(table, "General Requirements", request.GeneralRequirements);
                        RenderSection(table, "Common-Use Supplies", request.CommonUseSupplies);
                        RenderSection(table, "Miscellaneous Items", request.MiscellaneousItems);
                    });

                    // ── Footer Totals Block ───────────────────────────────────
                    col.Item().AlignRight().Width(350).PaddingTop(10).Border(1).BorderColor(Colors.Grey.Lighten1).Padding(6).Column(sb =>
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

        // Header row for the section
        table.Cell().ColumnSpan(12).Background(Colors.Grey.Lighten3).Padding(4)
            .Text(sectionTitle).Bold().FontSize(8);

        foreach (var item in items)
        {
            table.Cell().Element(TableDataCell).Text(item.ProjectTitle);
            table.Cell().Element(TableDataCell).Text(item.EndUserOrImplementingUnit);
            table.Cell().Element(TableDataCell).Text(item.GeneralDescription);
            table.Cell().Element(TableDataCell).Text(item.ModeOfProcurement);
            table.Cell().Element(TableDataCell).AlignCenter().Text(item.CoveredByEpa ? "Yes" : "No");
            table.Cell().Element(TableDataCell).Text(item.CriteriaForBidEvaluation);
            table.Cell().Element(TableDataCell).AlignCenter().Text(item.StartOfProcurement);
            table.Cell().Element(TableDataCell).AlignCenter().Text(item.EndOfProcurement);
            table.Cell().Element(TableDataCell).Text(item.SourceOfFund);
            table.Cell().Element(TableDataCell).AlignRight().Text($"₱{item.EstimatedBudget:N2}");
            table.Cell().Element(TableDataCell).Text(item.ProcurementStrategyOrTools);
            table.Cell().Element(TableDataCell).Text(item.Remarks);
        }
    }
}

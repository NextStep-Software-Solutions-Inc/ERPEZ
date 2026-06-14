using ERPEZ.Application.Common.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Infrastructure.Services.DocumentGeneration;
using ERPEZ.Infrastructure.Services.Renderers.Pdf.Base;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace ERPEZ.Infrastructure.Services.Renderers.Pdf;

internal sealed class PpmpPdfRenderer : BasePdfRenderer, IDocumentRenderer<PpmpDataDto>
{
    public DocumentType DocumentType => DocumentType.Ppmp;
    public ExportFormat Format       => ExportFormat.Pdf;

    public Task<byte[]> RenderAsync(
        PpmpDataDto       request,
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
                        .Text($"PROJECT PROCUREMENT MANAGEMENT PLAN (PPMP) NO. {request.PpmpNumber}")
                        .Bold().FontSize(11);

                    // Indicative / Final checkboxes using Unicode box characters
                    var indicativeBox = !request.IsFinal ? "☑" : "☐";
                    var finalBox      =  request.IsFinal ? "☑" : "☐";

                    h.Item().PaddingTop(3).AlignCenter()
                        .Text($"{indicativeBox} INDICATIVE     {finalBox} FINAL")
                        .FontSize(9);

                    h.Item().PaddingTop(6).Row(r =>
                    {
                        r.RelativeItem()
                            .Text($"Fiscal Year: {request.FiscalYear}")
                            .Bold().FontSize(8);
                        r.RelativeItem()
                            .Text($"End-User or Implementing Unit: {request.EndUserUnit}")
                            .Bold().FontSize(8);
                    });
                });

                // ── Content ────────────────────────────────────────────────
                page.Content().PaddingTop(8).Column(col =>
                {
                    col.Item().Table(table =>
                    {
                        // Relative widths (total = 20 units across A3 landscape ~390mm content width)
                        table.ColumnsDefinition(c =>
                        {
                            c.RelativeColumn(4f);   // Col 1  — Description
                            c.RelativeColumn(1.2f); // Col 2  — Type
                            c.RelativeColumn(1.8f); // Col 3  — Qty & Size
                            c.RelativeColumn(2f);   // Col 4  — Procurement Mode
                            c.RelativeColumn(1f);   // Col 5  — Pre-Proc Conference
                            c.RelativeColumn(1f);   // Col 6  — Start of Procurement
                            c.RelativeColumn(1f);   // Col 7  — End of Procurement
                            c.RelativeColumn(1.5f); // Col 8  — Delivery Period
                            c.RelativeColumn(1.5f); // Col 9  — Source of Funds
                            c.RelativeColumn(1.5f); // Col 10 — Estimated Budget
                            c.RelativeColumn(2f);   // Col 11 — Supporting Docs
                            c.RelativeColumn(1.5f); // Col 12 — Remarks
                        });

                        table.Header(h =>
                        {
                            // ── Row 1: Group labels ──────────────────────────────────
                            h.Cell().ColumnSpan(5).Element(TableHeaderCell)
                                .AlignCenter().AlignMiddle()
                                .Text("PROCUREMENT PROJECT DETAILS").Bold().FontSize(7);

                            h.Cell().ColumnSpan(3).Element(TableHeaderCell)
                                .AlignCenter().AlignMiddle()
                                .Text("PROJECTED TIMELINE\n(MM/YYYY)").Bold().FontSize(7);

                            h.Cell().ColumnSpan(2).Element(TableHeaderCell)
                                .AlignCenter().AlignMiddle()
                                .Text("FUNDING DETAILS").Bold().FontSize(7);

                            h.Cell().Element(TableHeaderCell)
                                .AlignCenter().AlignMiddle()
                                .Text("ATTACHED\nSUPPORTING\nDOCUMENTS").Bold().FontSize(7);

                            h.Cell().Element(TableHeaderCell)
                                .AlignCenter().AlignMiddle()
                                .Text("REMARKS").Bold().FontSize(7);

                            // ── Row 2: Individual column descriptive names ────────────
                            h.Cell().Element(TableHeaderCell).AlignCenter()
                                .Text("General Description and Objective\nof the Project to be Procured")
                                .Bold().FontSize(6);
                            h.Cell().Element(TableHeaderCell).AlignCenter()
                                .Text("Type of the Project\n(Goods / Infrastructure /\nConsulting Services)")
                                .Bold().FontSize(6);
                            h.Cell().Element(TableHeaderCell).AlignCenter()
                                .Text("Quantity and Size\nof the Project")
                                .Bold().FontSize(6);
                            h.Cell().Element(TableHeaderCell).AlignCenter()
                                .Text("Recommended\nMode of Procurement")
                                .Bold().FontSize(6);
                            h.Cell().Element(TableHeaderCell).AlignCenter()
                                .Text("Pre-Procurement\nConference\n(Yes/No)")
                                .Bold().FontSize(6);
                            h.Cell().Element(TableHeaderCell).AlignCenter()
                                .Text("Start of\nProcurement\nActivity")
                                .Bold().FontSize(6);
                            h.Cell().Element(TableHeaderCell).AlignCenter()
                                .Text("End of\nProcurement\nActivity")
                                .Bold().FontSize(6);
                            h.Cell().Element(TableHeaderCell).AlignCenter()
                                .Text("Expected\nDelivery/\nImplementation\nPeriod")
                                .Bold().FontSize(6);
                            h.Cell().Element(TableHeaderCell).AlignCenter()
                                .Text("Source\nof Funds")
                                .Bold().FontSize(6);
                            h.Cell().Element(TableHeaderCell).AlignCenter()
                                .Text("Estimated Budget /\nAuthorized Budgetary\nAllocation (PhP)")
                                .Bold().FontSize(6);
                            h.Cell().Element(TableHeaderCell).AlignCenter()
                                .Text("Attached\nSupporting\nDocuments")
                                .Bold().FontSize(6);
                            h.Cell().Element(TableHeaderCell).AlignCenter()
                                .Text("Remarks")
                                .Bold().FontSize(6);

                            // ── Row 3: Column numbers (matches official NGPA form) ────
                            for (var i = 1; i <= 12; i++)
                                h.Cell().Element(TableHeaderCell).AlignCenter()
                                    .Text($"Column {i}").Italic().FontSize(6);
                        });

                        // ── Data rows ─────────────────────────────────────────────
                        foreach (var row in request.Rows)
                        {
                            table.Cell().Element(TableDataCell).Text(row.GeneralDescription);
                            table.Cell().Element(TableDataCell).AlignCenter().Text(row.ProjectType);
                            table.Cell().Element(TableDataCell).Text(row.QuantityAndSize);
                            table.Cell().Element(TableDataCell).Text(row.ProcurementMode);
                            table.Cell().Element(TableDataCell).AlignCenter().Text(row.PreProcurementConference);
                            table.Cell().Element(TableDataCell).AlignCenter().Text(row.StartOfProcurement);
                            table.Cell().Element(TableDataCell).AlignCenter().Text(row.EndOfProcurement);
                            table.Cell().Element(TableDataCell).AlignCenter().Text(row.ExpectedDeliveryPeriod);
                            table.Cell().Element(TableDataCell).Text(row.SourceOfFunds);
                            table.Cell().Element(TableDataCell).AlignRight()
                                .Text($"₱{row.EstimatedBudget:N2}");
                            table.Cell().Element(TableDataCell).Text(row.AttachedSupportingDocuments);
                            table.Cell().Element(TableDataCell).Text(row.Remarks);
                        }

                        // ── Total budget row ──────────────────────────────────────
                        table.Cell().ColumnSpan(9).Element(TableDataCell)
                            .AlignRight().Text("TOTAL BUDGET:").Bold();
                        table.Cell().Element(TableDataCell).AlignRight()
                            .Text($"₱{request.TotalBudget:N2}").Bold();
                        table.Cell().ColumnSpan(2).Element(TableDataCell).Text(string.Empty);
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
}
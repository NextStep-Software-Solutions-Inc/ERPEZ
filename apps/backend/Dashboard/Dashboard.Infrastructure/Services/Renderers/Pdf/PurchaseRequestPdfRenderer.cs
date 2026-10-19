using System;
using System.Globalization;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Common.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Infrastructure.Services.DocumentGeneration;
using ERPEZ.Infrastructure.Services.Renderers.Pdf.Base;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace ERPEZ.Infrastructure.Services.Renderers.Pdf;

public sealed class PurchaseRequestPdfRenderer : BasePdfRenderer, IDocumentRenderer<PurchaseRequestDataDto>
{
    public DocumentType DocumentType => DocumentType.PurchaseRequest;
    public ExportFormat Format => ExportFormat.Pdf;

    public Task<byte[]> RenderAsync(
        PurchaseRequestDataDto request,
        CancellationToken cancellationToken = default)
    {
        var phCulture = new CultureInfo("en-PH");

        var pdf = Document.Create(doc =>
        {
            doc.Page(page =>
            {
                page.Size(PageSizes.A4.Portrait());
                page.Margin(1.2f, Unit.Centimetre);
                page.DefaultTextStyle(t => t.FontSize(8.5f).FontFamily("Arial"));

                // ── Page Header ────────────────────────────────────────────
                page.Header().Column(col =>
                {
                    RenderAgencyHeader(
                        col,
                        request.ProcuringEntityName ?? request.EntityName,
                        request.ProcuringEntityAddress,
                        request.LogoBytes,
                        appendixText: "Appendix 60",
                        documentTitle: "PURCHASE REQUEST",
                        showUnderline: false,
                        titleFontSize: 12f);

                    // ── Metadata Grid ──────────────────────────────────────
                    col.Item().Border(1).BorderColor(Colors.Black).Table(metaTable =>
                    {
                        metaTable.ColumnsDefinition(c =>
                        {
                            c.RelativeColumn(2.2f); // Entity / Office
                            c.RelativeColumn(1.8f); // Fund Cluster / PR No / Res Code
                            c.RelativeColumn(1.2f); // UACS / Date / Status
                        });

                        // Row 1
                        metaTable.Cell().BorderRight(1).BorderBottom(0.5f).Padding(3).Column(c =>
                        {
                            c.Item().Text("Entity Name:").FontSize(7).SemiBold();
                            c.Item().Text(string.IsNullOrWhiteSpace(request.EntityName) ? "—" : request.EntityName).FontSize(8);
                        });
                        metaTable.Cell().BorderRight(1).BorderBottom(0.5f).Padding(3).Column(c =>
                        {
                            c.Item().Text("Fund Cluster:").FontSize(7).SemiBold();
                            c.Item().Text(string.IsNullOrWhiteSpace(request.FundCluster) ? "—" : request.FundCluster).FontSize(8);
                        });
                        metaTable.Cell().BorderBottom(0.5f).Padding(3).Column(c =>
                        {
                            c.Item().Text("UACS:").FontSize(7).SemiBold();
                            c.Item().Text(string.IsNullOrWhiteSpace(request.UacsCode) ? "—" : request.UacsCode).FontSize(8);
                        });

                        // Row 2
                        metaTable.Cell().BorderRight(1).BorderBottom(0.5f).Padding(3).Column(c =>
                        {
                            c.Item().Text("Office/Section:").FontSize(7).SemiBold();
                            c.Item().Text(string.IsNullOrWhiteSpace(request.OfficeSection) ? "—" : request.OfficeSection).FontSize(8).Bold();
                        });
                        metaTable.Cell().BorderRight(1).BorderBottom(0.5f).Padding(3).Column(c =>
                        {
                            c.Item().Text("PR No.:").FontSize(7).SemiBold();
                            c.Item().Text(request.PRNumber).FontSize(8.5f).Bold();
                        });
                        metaTable.Cell().BorderBottom(0.5f).Padding(3).Column(c =>
                        {
                            c.Item().Text("Date:").FontSize(7).SemiBold();
                            c.Item().Text(request.Date?.ToString("M/d/yyyy") ?? "—").FontSize(8);
                        });

                        // Row 3
                        metaTable.Cell().BorderRight(1).Padding(3).Column(c =>
                        {
                            // Blank left section
                            c.Item().Text("");
                        });
                        metaTable.Cell().BorderRight(1).Padding(3).Column(c =>
                        {
                            c.Item().Text("Responsibility Center Code:").FontSize(7).SemiBold();
                            c.Item().Text(string.IsNullOrWhiteSpace(request.ResponsibilityCenterCode) ? "—" : request.ResponsibilityCenterCode).FontSize(8);
                        });
                        metaTable.Cell().Padding(3).Column(c =>
                        {
                            c.Item().Text("Status:").FontSize(7).SemiBold();
                            c.Item().Text(string.IsNullOrWhiteSpace(request.Status) ? "DRAFT" : request.Status).FontSize(8).Bold();
                        });
                    });
                });

                // ── Page Content ───────────────────────────────────────────
                page.Content().PaddingTop(6).Column(col =>
                {
                    // ── Items Table ────────────────────────────────────────
                    col.Item().Border(1).BorderColor(Colors.Black).Table(table =>
                    {
                        table.ColumnsDefinition(c =>
                        {
                            c.RelativeColumn(0.9f); // Item No
                            c.RelativeColumn(4.3f); // Item Description
                            c.RelativeColumn(0.9f); // Qty
                            c.RelativeColumn(0.9f); // Unit
                            c.RelativeColumn(1.5f); // Unit Cost
                            c.RelativeColumn(1.5f); // Total Cost
                        });

                        table.Header(h =>
                        {
                            h.Cell().Element(TableHeaderCell).Text("ITEM NO.").Bold().FontSize(7.5f);
                            h.Cell().Element(TableHeaderCell).Text("ITEM DESCRIPTION").Bold().FontSize(7.5f);
                            h.Cell().Element(TableHeaderCell).Text("QTY").Bold().FontSize(7.5f);
                            h.Cell().Element(TableHeaderCell).Text("UNIT").Bold().FontSize(7.5f);
                            h.Cell().Element(TableHeaderCell).Text("UNIT COST").Bold().FontSize(7.5f);
                            h.Cell().Element(TableHeaderCell).Text("TOTAL COST").Bold().FontSize(7.5f);
                        });

                        foreach (var item in request.Items)
                        {
                            table.Cell().Element(TableDataCell).AlignCenter().Text(item.ItemNo.ToString()).FontSize(8);

                            table.Cell().Element(TableDataCell).Column(descCol =>
                            {
                                descCol.Item().Text(item.ItemName).Bold().FontSize(8);
                                if (!string.IsNullOrWhiteSpace(item.Description) && !item.Description.Equals(item.ItemName, StringComparison.OrdinalIgnoreCase))
                                {
                                    descCol.Item().PaddingTop(1).Text($"Specs: {item.Description}").FontSize(7).Italic();
                                }
                            });

                            table.Cell().Element(TableDataCell).AlignCenter().Text(item.Quantity.ToString("0.00")).FontSize(8);
                            table.Cell().Element(TableDataCell).AlignCenter().Text(string.IsNullOrWhiteSpace(item.Unit) ? "unit" : item.Unit).FontSize(8);
                            table.Cell().Element(TableDataCell).AlignRight().Text(item.UnitCost.ToString("N2", phCulture)).FontSize(8);
                            table.Cell().Element(TableDataCell).AlignRight().Text(item.TotalCost.ToString("N2", phCulture)).FontSize(8);
                        }

                        // Total Row
                        table.Cell().ColumnSpan(5).Element(TableDataCell).AlignRight().PaddingRight(6).Text("TOTAL").Bold().FontSize(8.5f);
                        table.Cell().Element(TableDataCell).AlignRight().Text(request.TotalAmount.ToString("N2", phCulture)).Bold().FontSize(8.5f);
                    });

                    // ── Purpose Section ────────────────────────────────────
                    col.Item().PaddingTop(8).Border(1).BorderColor(Colors.Black).Padding(4).Column(p =>
                    {
                        p.Item().Text(t =>
                        {
                            t.Span("PURPOSE: ").Bold().FontSize(8);
                            t.Span(string.IsNullOrWhiteSpace(request.Purpose) ? "N/A" : request.Purpose).FontSize(8);
                        });
                    });

                    // ── Signatures Section (Appendix 60 Layout) ─────────────
                    col.Item().PaddingTop(10).Border(1).BorderColor(Colors.Black).Table(sigTable =>
                    {
                        sigTable.ColumnsDefinition(c =>
                        {
                            c.RelativeColumn(1f); // Requested by
                            c.RelativeColumn(1f); // Recommending Approval
                            c.RelativeColumn(1f); // Funds Available
                            c.RelativeColumn(1f); // Approved by
                        });

                        var reqSig = request.Signatories.ElementAtOrDefault(0) ?? new SignatoryDto { Label = "Requested by:", PrintedName = "END-USER", Designation = "END-USER" };
                        var recSig = request.Signatories.ElementAtOrDefault(1) ?? new SignatoryDto { Label = "Recommending Approval:", PrintedName = "ENGR. ALEX L. MAUREAL", Designation = "VC for Research and Innovation" };
                        var fundSig = request.Signatories.ElementAtOrDefault(2) ?? new SignatoryDto { Label = "Funds Available:", PrintedName = "CHERRY ANN S. VILLARTE, CPA", Designation = "Director, Financial Management Services" };
                        var appSig = request.Signatories.ElementAtOrDefault(3) ?? new SignatoryDto { Label = "Approved by:", PrintedName = "ATTY. DIONEL O. ALBINA", Designation = "Chancellor, USTP-CDO" };

                        sigTable.Cell().BorderRight(0.5f).Padding(4).Column(sc =>
                        {
                            sc.Item().Text(reqSig.Label).FontSize(7.5f).SemiBold();
                            sc.Item().PaddingTop(20).Text(reqSig.PrintedName).Bold().FontSize(8);
                            sc.Item().Text(reqSig.Designation).FontSize(7).Italic();
                        });

                        sigTable.Cell().BorderRight(0.5f).Padding(4).Column(sc =>
                        {
                            sc.Item().Text(recSig.Label).FontSize(7.5f).SemiBold();
                            sc.Item().PaddingTop(20).Text(recSig.PrintedName).Bold().FontSize(8);
                            sc.Item().Text(recSig.Designation).FontSize(7).Italic();
                        });

                        sigTable.Cell().BorderRight(0.5f).Padding(4).Column(sc =>
                        {
                            sc.Item().Text(fundSig.Label).FontSize(7.5f).SemiBold();
                            sc.Item().PaddingTop(20).Text(fundSig.PrintedName).Bold().FontSize(8);
                            sc.Item().Text(fundSig.Designation).FontSize(7).Italic();
                        });

                        sigTable.Cell().Padding(4).Column(sc =>
                        {
                            sc.Item().Text(appSig.Label).FontSize(7.5f).SemiBold();
                            sc.Item().PaddingTop(20).Text(appSig.PrintedName).Bold().FontSize(8);
                            sc.Item().Text(appSig.Designation).FontSize(7).Italic();
                        });
                    });
                });

                // ── Page Footer ────────────────────────────────────────────
                page.Footer().PaddingTop(6).Row(row =>
                {
                    row.RelativeItem().Text("GIAMS 2022, (c) Copyright 2022, Digital Transformation Office (DTO)").FontSize(7).Italic();
                    row.RelativeItem().AlignRight().Text(t =>
                    {
                        t.Span("Page: ").FontSize(7);
                        t.CurrentPageNumber().FontSize(7);
                        t.Span(" of ").FontSize(7);
                        t.TotalPages().FontSize(7);
                    });
                });
            });
        });

        return Task.FromResult(pdf.GeneratePdf());
    }
}

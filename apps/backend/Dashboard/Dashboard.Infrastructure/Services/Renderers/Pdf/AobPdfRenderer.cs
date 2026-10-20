using System;
using System.Globalization;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.AOBs.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Infrastructure.Services.DocumentGeneration;
using ERPEZ.Infrastructure.Services.Renderers.Pdf.Base;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace ERPEZ.Infrastructure.Services.Renderers.Pdf;

public sealed class AobPdfRenderer : BasePdfRenderer, IDocumentRenderer<AobDataDto>
{
    public DocumentType DocumentType => DocumentType.Aob;
    public ExportFormat Format => ExportFormat.Pdf;

    public Task<byte[]> RenderAsync(AobDataDto request, CancellationToken cancellationToken = default)
    {
        var phCulture = new CultureInfo("en-PH");
        var logoBytes = request.LogoBytes ?? LoadDefaultLogo();

        var pdf = Document.Create(doc =>
        {
            doc.Page(page =>
            {
                page.Size(PageSizes.A4.Landscape());
                page.Margin(1.0f, Unit.Centimetre);
                page.DefaultTextStyle(t => t.FontSize(8).FontFamily("Arial"));

                // ── HEADER ──────────────────────────────────────────────────────────
                page.Header().Column(col =>
                {
                    RenderAgencyHeader(
                        col,
                        request.ProcuringEntityName,
                        request.ProcuringEntityAddress,
                        logoBytes,
                        appendixText: null,
                        documentTitle: "ABSTRACT OF QUOTATION",
                        documentSubtitle: !string.IsNullOrWhiteSpace(request.ModeOfProcurement)
                            ? $"({request.ModeOfProcurement})"
                            : null,
                        showUnderline: true,
                        titleFontSize: 12f);

                    col.Item().PaddingTop(8).Column(meta =>
                    {
                        meta.Item().Row(r =>
                        {
                            r.ConstantItem(140).Text("PROJECT NAME:").Bold().FontSize(8.5f);
                            r.RelativeItem().Text(request.ProjectName).Bold().FontSize(8.5f);
                        });

                        meta.Item().Row(r =>
                        {
                            r.ConstantItem(140).Text("DELIVERY LOCATION:").Bold().FontSize(8.5f);
                            r.RelativeItem().Text(request.DeliveryLocation).Bold().FontSize(8.5f);
                        });

                        meta.Item().Row(r =>
                        {
                            r.ConstantItem(140).Text("IMPLEMENTING OFFICE:").Bold().FontSize(8.5f);
                            r.RelativeItem().Text(request.ImplementingOffice).Bold().FontSize(8.5f);
                        });

                        meta.Item().Row(r =>
                        {
                            r.ConstantItem(140).Text("APPROVED TOTAL COST:").Bold().FontSize(8.5f);
                            r.RelativeItem().Text(request.ApprovedTotalCost.ToString("C2", phCulture)).Bold().FontSize(8.5f);
                        });
                    });
                });

                // ── TABLE CONTENT ───────────────────────────────────────────────────
                page.Content().PaddingTop(8).Column(col =>
                {
                    col.Item().Border(1).BorderColor(Colors.Black).Table(table =>
                    {
                        var suppliers = request.Suppliers;

                        table.ColumnsDefinition(c =>
                        {
                            c.ConstantColumn(30); // ITEM #
                            c.ConstantColumn(32); // QTY
                            c.ConstantColumn(36); // UNIT
                            c.RelativeColumn(2.5f); // DESCRIPTIONS AND SPECIFICATIONS
                            c.ConstantColumn(65); // UNIT COST

                            foreach (var _ in suppliers)
                            {
                                c.RelativeColumn(1.6f); // OFFER
                                c.ConstantColumn(65);   // UNIT PRICE
                            }
                        });

                        // ── TABLE HEADER: ROW 1 ──
                        table.Header(header =>
                        {
                            header.Cell().RowSpan(2).Element(AbstractHeaderCell).Text("ITEM #").Bold().FontSize(7.5f);
                            header.Cell().RowSpan(2).Element(AbstractHeaderCell).Text("QTY").Bold().FontSize(7.5f);
                            header.Cell().RowSpan(2).Element(AbstractHeaderCell).Text("UNIT").Bold().FontSize(7.5f);
                            header.Cell().RowSpan(2).Element(AbstractHeaderCell).Text("DESCRIPTIONS AND SPECIFICATIONS").Bold().FontSize(7.5f);
                            header.Cell().RowSpan(2).Element(AbstractHeaderCell).Text("UNIT COST").Bold().FontSize(7.5f);

                            foreach (var s in suppliers)
                            {
                                header.Cell().ColumnSpan(2).Element(AbstractHeaderCell).Column(sc =>
                                {
                                    sc.Item().Text(s.SupplierName).Bold().FontSize(7.5f);
                                    if (!string.IsNullOrWhiteSpace(s.Address) && s.Address != "[ADDRESS / CONTACT]")
                                    {
                                        sc.Item().Text(s.Address).FontSize(6.5f).FontColor(Colors.Grey.Darken2);
                                    }
                                });
                            }

                            // ── TABLE HEADER: ROW 2 ──
                            foreach (var _ in suppliers)
                            {
                                header.Cell().Element(AbstractHeaderCell).Text("OFFER").Bold().FontSize(7);
                                header.Cell().Element(AbstractHeaderCell).Text("UNIT PRICE").Bold().FontSize(7);
                            }
                        });

                        // ── BODY ROWS ──
                        foreach (var item in request.Items)
                        {
                            // Counting number strictly used
                            table.Cell().Element(AbstractDataCell).AlignCenter().Text(item.ItemNo.ToString()).Bold();
                            table.Cell().Element(AbstractDataCell).AlignCenter().Text(item.Quantity.ToString("0.##"));
                            table.Cell().Element(AbstractDataCell).AlignCenter().Text(item.Unit);

                            table.Cell().Element(AbstractDataCell).Column(desc =>
                            {
                                desc.Item().Text(item.ItemName).Bold().FontSize(7.5f);
                                if (!string.IsNullOrWhiteSpace(item.Specifications) && item.Specifications != item.ItemName)
                                {
                                    desc.Item().Text(item.Specifications).FontSize(6.5f).FontColor(Colors.Grey.Darken3);
                                }
                            });

                            table.Cell().Element(AbstractDataCell).AlignRight().Text(item.ApprovedUnitCost.ToString("C2", phCulture)).Bold().FontSize(7.5f);

                            foreach (var s in suppliers)
                            {
                                var bid = s.Bids.FirstOrDefault(b => b.RFQItemId == item.RFQItemId);

                                if (bid == null || !bid.DidSubmit || (!bid.UnitPrice.HasValue && !bid.TotalPrice.HasValue))
                                {
                                    table.Cell().Element(AbstractDataCell).AlignCenter().Text("—").FontColor(Colors.Grey.Medium);
                                    table.Cell().Element(AbstractDataCell).AlignCenter().Text("DID NOT SUBMIT").Bold().FontSize(6.5f);
                                    continue;
                                }

                                var unitPrice = bid.UnitPrice ?? (bid.TotalPrice.HasValue && item.Quantity > 0 ? bid.TotalPrice.Value / item.Quantity : 0);

                                table.Cell().Element(AbstractDataCell).Column(offer =>
                                {
                                    var offerText = !string.IsNullOrWhiteSpace(bid.OfferedBrand)
                                        ? bid.OfferedBrand
                                        : (!string.IsNullOrWhiteSpace(bid.OfferedRemarks) ? bid.OfferedRemarks : "As per specifications");

                                    offer.Item().Text(offerText).FontSize(7);

                                    if (!string.IsNullOrWhiteSpace(bid.DeliveryPeriod))
                                    {
                                        offer.Item().Text($"Delivery: {bid.DeliveryPeriod}").FontSize(6.5f).Italic();
                                    }

                                    if (bid.TotalPrice.HasValue)
                                    {
                                        offer.Item().Text($"Subtotal: {bid.TotalPrice.Value.ToString("C2", phCulture)}").FontSize(6.5f);
                                    }
                                });

                                if (bid.IsWinner)
                                {
                                    table.Cell().Element(AbstractDataCell).AlignRight().AlignMiddle()
                                        .Border(1.5f).BorderColor(Colors.Black).Padding(2)
                                        .Text(unitPrice.ToString("C2", phCulture)).Bold().FontSize(7.5f);
                                }
                                else
                                {
                                    table.Cell().Element(AbstractDataCell).AlignRight().AlignMiddle()
                                        .Text(unitPrice.ToString("C2", phCulture)).FontSize(7.5f);
                                }
                            }
                        }

                        // ── TOTAL ROW ──
                        table.Cell().ColumnSpan(4).Element(AbstractDataCell).AlignRight().Text("Total").Bold().FontSize(8);
                        table.Cell().Element(AbstractDataCell).AlignRight().Text(request.ApprovedTotalCost.ToString("C2", phCulture)).Bold().FontSize(8);

                        foreach (var s in suppliers)
                        {
                            table.Cell().Element(AbstractDataCell).Text("");

                            if (s.TotalQuotation > 0)
                            {
                                if (s.HasWonAnyItem)
                                {
                                    table.Cell().Element(AbstractDataCell).AlignRight().AlignMiddle()
                                        .Border(1.5f).BorderColor(Colors.Black).Padding(2)
                                        .Text(s.TotalQuotation.ToString("C2", phCulture)).Bold().FontSize(8);
                                }
                                else
                                {
                                    table.Cell().Element(AbstractDataCell).AlignRight().AlignMiddle()
                                        .Text(s.TotalQuotation.ToString("C2", phCulture)).Bold().FontSize(8);
                                }
                            }
                            else
                            {
                                table.Cell().Element(AbstractDataCell).AlignCenter().Text("—").FontColor(Colors.Grey.Medium);
                            }
                        }
                    });

                    // Committee recommendation note
                    col.Item().PaddingTop(6).Text("The Bids and Awards Committee recommends the award to the supplier with the lowest complying proposal that is boxed")
                        .Italic().Bold().FontSize(7.5f);

                    // Signatories horizontal row
                    col.Item().PaddingTop(18).Row(sigRow =>
                    {
                        foreach (var sig in request.Signatories)
                        {
                            sigRow.RelativeItem().Column(sc =>
                            {
                                sc.Item().AlignCenter().Text(sig.Name).Bold().Underline().FontSize(8);
                                sc.Item().AlignCenter().Text(sig.Title).FontSize(7).FontColor(Colors.Grey.Darken3);
                            });
                        }
                    });

                    // Approval Block
                    col.Item().PaddingTop(14).Row(appRow =>
                    {
                        appRow.RelativeItem(0.5f).Column(ac =>
                        {
                            ac.Item().Text("APPROVED BY:").Bold().FontSize(8);
                            ac.Item().PaddingTop(14).Text(request.ApprovedByName).Bold().Underline().FontSize(8.5f);
                            ac.Item().Text(request.ApproverTitle).FontSize(7.5f).FontColor(Colors.Grey.Darken3);
                        });

                        // Reference footer metadata
                        appRow.RelativeItem(0.5f).AlignRight().Column(rc =>
                        {
                            rc.Item().Row(r =>
                            {
                                r.ConstantItem(90).Text("RFQ No.:").Bold().FontSize(7.5f);
                                r.RelativeItem().Text(request.RFQNumber).FontSize(7.5f);
                            });
                            rc.Item().Row(r =>
                            {
                                r.ConstantItem(90).Text("BAC RES. NO.:").Bold().FontSize(7.5f);
                                r.RelativeItem().Text(request.BacResolutionNumber).FontSize(7.5f);
                            });
                            rc.Item().Row(r =>
                            {
                                r.ConstantItem(90).Text("PR No.:").Bold().FontSize(7.5f);
                                r.RelativeItem().Text(request.PRNumber).FontSize(7.5f);
                            });
                            rc.Item().Row(r =>
                            {
                                r.ConstantItem(90).Text("Code (PAP):").Bold().FontSize(7.5f);
                                r.RelativeItem().Text(request.PAPCode).FontSize(7.5f);
                            });
                        });
                    });
                });

                // ── FOOTER ──────────────────────────────────────────────────────────
                page.Footer().BorderTop(0.5f).BorderColor(Colors.Grey.Medium).PaddingTop(2).Row(f =>
                {
                    f.RelativeItem().Text("ERP-EZ · Procurement Management System").FontSize(6.5f).FontColor(Colors.Grey.Darken1);
                    f.RelativeItem().AlignRight().Text("1 of 1").FontSize(6.5f).FontColor(Colors.Grey.Darken1);
                });
            });
        });

        return Task.FromResult(pdf.GeneratePdf());
    }

    private static IContainer AbstractHeaderCell(IContainer container) =>
        container.Border(0.5f).BorderColor(Colors.Black)
                 .Background(Colors.White)
                 .Padding(3)
                 .AlignCenter()
                 .AlignMiddle();

    private static IContainer AbstractDataCell(IContainer container) =>
        container.Border(0.5f).BorderColor(Colors.Black)
                 .Padding(3);
}

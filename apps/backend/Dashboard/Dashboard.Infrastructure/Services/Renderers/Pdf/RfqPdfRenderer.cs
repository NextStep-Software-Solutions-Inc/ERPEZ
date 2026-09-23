using System;
using System.Globalization;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.RequestForQuotation.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Infrastructure.Services.DocumentGeneration;
using ERPEZ.Infrastructure.Services.Renderers.Pdf.Base;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace ERPEZ.Infrastructure.Services.Renderers.Pdf;

public sealed class RfqPdfRenderer : BasePdfRenderer, IDocumentRenderer<RfqDataDto>
{
    public DocumentType DocumentType => DocumentType.Rfq;
    public ExportFormat Format => ExportFormat.Pdf;

    public Task<byte[]> RenderAsync(RfqDataDto request, CancellationToken cancellationToken = default)
    {
        var phCulture = new CultureInfo("en-PH");
        var logoBytes = LoadDefaultLogo();

        var pdf = Document.Create(doc =>
        {
            var primarySupplier = request.Suppliers.FirstOrDefault(s => !string.IsNullOrWhiteSpace(s.SupplierName) && !s.SupplierName.Trim().StartsWith("["))
                ?? request.Suppliers.FirstOrDefault()
                ?? new RfqSupplierDataDto
                {
                    SupplierName = "[Supplier / Bidder Name]",
                    TradeName = "[Business / Store Name]",
                    Address = "[Supplier Address]"
                };

            // ══════════════════════════════════════════════════════════════════════
            // PAGE 1: INVITATION / REQUEST FOR SUBMISSION OF PRICE QUOTATION
            //         (Posted in PhilGEPS Website / Conspicuous Place)
            // ══════════════════════════════════════════════════════════════════════
            doc.Page(page =>
            {
                page.Size(PageSizes.A4.Portrait());
                page.Margin(1.5f, Unit.Centimetre);
                page.DefaultTextStyle(t => t.FontSize(9).FontFamily("Arial"));

                page.Header().Column(col =>
                {
                    RenderHeaderLogo(col, logoBytes, request.ProcuringEntity, request.ProcuringEntityAddress);

                    col.Item().PaddingTop(16).AlignCenter()
                        .Text("INVITATION / REQUEST FOR SUBMISSION OF PRICE QUOTATION")
                        .Bold().FontSize(11.5f);

                    col.Item().PaddingTop(2).AlignCenter()
                        .Text("Posted in PhilGEPS Website/Conspicuous Place at the Procuring Entity")
                        .FontSize(9).Italic();
                });

                page.Content().PaddingTop(14).Column(col =>
                {
                    col.Item().Text($"The {request.ProcuringEntity}, through the Bids and Awards Committee (BAC) hereby invites interested parties to submit quotation for the procurement of the following item:")
                        .FontSize(9).LineHeight(1.3f);

                    // Notice summary table
                    col.Item().PaddingTop(12).Border(1).BorderColor(Colors.Black).Table(table =>
                    {
                        table.ColumnsDefinition(c =>
                        {
                            c.RelativeColumn(1.4f); // Reference No.
                            c.RelativeColumn(1.0f); // Qty.
                            c.RelativeColumn(1.0f); // Unit
                            c.RelativeColumn(2.5f); // Specification/Description
                            c.RelativeColumn(1.3f); // Budget for the Contract
                            c.RelativeColumn(2.0f); // Mode of Procurement
                        });

                        table.Header(h =>
                        {
                            h.Cell().Element(NoticeTableHeaderCell).Text("Reference No.").Bold().FontSize(8);
                            h.Cell().Element(NoticeTableHeaderCell).Text("Qty.").Bold().FontSize(8);
                            h.Cell().Element(NoticeTableHeaderCell).Text("Unit").Bold().FontSize(8);
                            h.Cell().Element(NoticeTableHeaderCell).Text("Specification/Description").Bold().FontSize(8);
                            h.Cell().Element(NoticeTableHeaderCell).Text("Budget for the Contract").Bold().FontSize(8);
                            h.Cell().Element(NoticeTableHeaderCell).Text("Mode of Procurement").Bold().FontSize(8);
                        });

                        table.Cell().Element(NoticeTableCell).AlignCenter().Text(request.RFQNumber).Bold().FontSize(8);
                        table.Cell().Element(NoticeTableCell).AlignCenter().Text("Please see the details on the attached RFQ.").FontSize(7.5f);
                        table.Cell().Element(NoticeTableCell).AlignCenter().Text("Please see the details on the attached RFQ.").FontSize(7.5f);
                        table.Cell().Element(NoticeTableCell).Text(request.ProjectName).Bold().FontSize(8);
                        table.Cell().Element(NoticeTableCell).AlignRight().Text(request.ApprovedBudgetForContract.ToString("N2", phCulture)).Bold().FontSize(8);
                        table.Cell().Element(NoticeTableCell).Text(request.ModeOfProcurement).FontSize(7.5f);
                    });

                    // Deadline & Submission Paragraph
                    col.Item().PaddingTop(16).Text(t =>
                    {
                        t.Span("Deadline for the submission of quotation is on ").FontSize(8.5f);
                        t.Span(request.Deadline).Bold().FontSize(8.5f);
                        t.Span($" at the {request.SubmissionLocation}. You may submit your quotation through email: ").FontSize(8.5f);
                        t.Span(request.ContactEmail).Bold().FontSize(8.5f);
                        t.Span($" or call telephone number {request.ContactPhone} or through personal delivery in a sealed envelope.").FontSize(8.5f);
                    });

                    // Reservation clause
                    col.Item().PaddingTop(12).Text($"The {request.ProcuringEntity} reserves the right to accept or reject any or all bids / price quotations, to annul the process, and to reject all bids at any time prior to contract award, without thereby incurring any liability to the affected bidder or bidders.")
                        .FontSize(8.5f).LineHeight(1.25f);

                    // Signatory
                    col.Item().PaddingTop(30).Column(sc =>
                    {
                        sc.Item().Text("(SGD.)").FontSize(8.5f);
                        sc.Item().PaddingTop(2).Text(request.BacChairpersonName).Bold().FontSize(9);
                        sc.Item().Text(request.BacChairpersonTitle).FontSize(8);
                    });
                });

                RenderStandardFooter(page);
            });

            // ══════════════════════════════════════════════════════════════════════
            // PAGE 2: REQUEST FOR QUOTATION FORM
            // ══════════════════════════════════════════════════════════════════════
            doc.Page(page =>
            {
                page.Size(PageSizes.A4.Portrait());
                page.Margin(1.3f, Unit.Centimetre);
                page.DefaultTextStyle(t => t.FontSize(8).FontFamily("Arial"));

                page.Header().Column(col =>
                {
                    RenderHeaderLogo(col, logoBytes, request.ProcuringEntity, request.ProcuringEntityAddress);

                    // Metadata Row
                    col.Item().PaddingTop(6).Row(row =>
                    {
                        row.RelativeItem(5).Column(left =>
                        {
                            left.Item().Text("The Manager").Bold().FontSize(8.5f);
                            left.Item().PaddingTop(2).Text(request.IsBlankTemplate ? "" : primarySupplier.SupplierName).Bold().FontSize(9);
                            left.Item().Text("Business/Trade/Store Name").FontSize(7.5f).Italic();
                            left.Item().PaddingTop(2).Text(request.IsBlankTemplate ? "" : primarySupplier.Address).FontSize(8);
                            left.Item().BorderBottom(0.5f).BorderColor(Colors.Black).Text("Address").FontSize(7.5f).Italic();
                        });

                        row.RelativeItem(5).Column(right =>
                        {
                            right.Item().Text($"Date: {request.Date}").FontSize(8);
                            right.Item().Text($"Quotation No: {(!string.IsNullOrWhiteSpace(request.QuotationNo) ? request.QuotationNo : request.RFQNumber)}").Bold().FontSize(8);
                            right.Item().Text($"Project Name: {request.ProjectName}").Bold().FontSize(8);
                        });
                    });

                    col.Item().PaddingTop(8).Text(t =>
                    {
                        t.Span("Please quote your lowest price on the item/s listed below, subject to the general conditions below, stating the shortest time of delivery and submit your quotation duly signed by your representative not later than ").FontSize(8);
                        t.Span(request.Deadline).Bold().FontSize(8);
                        t.Span(".").FontSize(8);
                    });

                    col.Item().PaddingTop(2).Text("Please enclosed in a sealed envelope.").Bold().FontSize(8);

                    // Chairperson Signature
                    col.Item().PaddingTop(4).AlignRight().Column(sc =>
                    {
                        sc.Item().Text("(SGD.)").FontSize(8);
                        sc.Item().Text(request.BacChairpersonName).Bold().FontSize(8.5f);
                        sc.Item().Text(request.BacChairpersonTitle).FontSize(7.5f);
                    });

                    // Notes Section
                    col.Item().PaddingTop(4).Column(nc =>
                    {
                        nc.Item().Text("NOTE:").Bold().FontSize(7.5f);
                        nc.Item().Text($"1. DELIVERY PERIOD: {request.DeliveryPeriod}").FontSize(7);
                        nc.Item().Text($"2. DELIVERY LOCATION: {request.DeliveryLocation}").FontSize(7);
                        nc.Item().Text("3. PAYMENT TERMS: One Time Payment").FontSize(7);
                        nc.Item().Text("4. PRICE VALIDITY SHALL BE FOR A PERIOD OF 30 CALENDAR DAYS").FontSize(7);
                        nc.Item().Text("5. BIDDERS MUST INDICATE THE BRAND AND/OR MODEL NUMBER FOR EQUIPMENT AND ITS ACCESSORIES OR PERIPHERALS AND FOR ALL OTHER ITEMS IF APPLICABLE. BIDDERS SHALL SUBMIT ORIGINAL BROCHURES SHOWING CERTIFICATIONS OF THE PRODUCT BEING OFFERED IF APPLICABLE.").FontSize(7);
                        nc.Item().Text($"6. THE {request.ProcuringEntity.ToUpper()} RESERVES THE RIGHT TO REJECT ANY OR ALL BIDS FOR ANY JUSTIFIABLE GROUND WHERE THE AWARD OF THE CONTRACT WILL NOT REDOUND TO THE BENEFIT OF THE GOP.").FontSize(7);
                        nc.Item().Text("7. REQUIREMENTS: PHILGEPS REGISTRATION.").FontSize(7);
                    });
                });

                page.Content().PaddingTop(6).Column(col =>
                {
                    // Items and Quotation Offer Table
                    col.Item().Border(1).BorderColor(Colors.Black).Table(table =>
                    {
                        table.ColumnsDefinition(c =>
                        {
                            c.RelativeColumn(0.7f); // Item #
                            c.RelativeColumn(0.8f); // Qty
                            c.RelativeColumn(0.8f); // Unit
                            c.RelativeColumn(3.5f); // Description and Specifications
                            c.RelativeColumn(1.3f); // Approved Unit Cost
                            c.RelativeColumn(2.5f); // Offer
                            c.RelativeColumn(1.4f); // Quoted Unit Price
                        });

                        table.Header(h =>
                        {
                            h.Cell().Element(TableHeaderCell).Text("ITEM #").Bold().FontSize(7.5f);
                            h.Cell().Element(TableHeaderCell).Text("QTY").Bold().FontSize(7.5f);
                            h.Cell().Element(TableHeaderCell).Text("UNIT").Bold().FontSize(7.5f);
                            h.Cell().Element(TableHeaderCell).Text("DESCRIPTION AND\nSPECIFICATIONS").Bold().FontSize(7.5f);
                            h.Cell().Element(TableHeaderCell).Text("APPROVED\nUNIT COST\n(Php)").Bold().FontSize(7.5f);
                            h.Cell().Element(TableHeaderCell).Text("OFFER\n(Suppliers must provide Brand, Model,\nand detailed technical specifications)").Bold().FontSize(6.5f);
                            h.Cell().Element(TableHeaderCell).Text("QUOTED UNIT\nPRICE PER\nOFFER").Bold().FontSize(7.5f);
                        });

                        var quotedItems = primarySupplier.QuotedItems.Any() ? primarySupplier.QuotedItems : request.Items;
                        foreach (var item in quotedItems)
                        {
                            table.Cell().Element(TableDataCell).AlignCenter().Text(item.ItemNo.ToString()).FontSize(8);
                            table.Cell().Element(TableDataCell).AlignCenter().Text(item.Quantity.ToString("0.00")).FontSize(8);
                            table.Cell().Element(TableDataCell).AlignCenter().Text(item.Unit).FontSize(8);

                            table.Cell().Element(TableDataCell).Column(dc =>
                            {
                                dc.Item().Text(item.ItemName).Bold().FontSize(8);
                                if (!string.IsNullOrWhiteSpace(item.Specifications) && !item.Specifications.Equals(item.ItemName, StringComparison.OrdinalIgnoreCase))
                                {
                                    dc.Item().PaddingTop(1).Text(item.Specifications).FontSize(7);
                                }
                            });

                            table.Cell().Element(TableDataCell).AlignRight().Text(item.ApprovedUnitCost.ToString("N2", phCulture)).FontSize(8);

                            table.Cell().Element(TableDataCell).Column(oc =>
                            {
                                if (!request.IsBlankTemplate && !string.IsNullOrWhiteSpace(item.OfferedSpecifications))
                                {
                                    oc.Item().Text(item.OfferedSpecifications).FontSize(8);
                                }
                                oc.Item().PaddingTop(2).Text($"Delivery period: {request.DeliveryPeriod}").FontSize(6.5f).Italic();
                            });

                            table.Cell().Element(TableDataCell).Column(qc =>
                            {
                                if (!request.IsBlankTemplate && item.QuotedUnitPrice.HasValue && item.QuotedUnitPrice.Value > 0)
                                {
                                    qc.Item().AlignRight().Text(item.QuotedUnitPrice.Value.ToString("N2", phCulture)).Bold().FontSize(8);
                                }
                                qc.Item().PaddingTop(2).Text("Price validity: 30 days").FontSize(6.5f).Italic();
                            });
                        }
                    });

                    // Acceptance paragraph and signature
                    col.Item().PaddingTop(10).Text("After having carefully read and accepted for General Conditions, I/We quote on the item at prices noted above.")
                        .FontSize(7.5f).Italic();

                    col.Item().PaddingTop(16).AlignRight().Column(sigCol =>
                    {
                        if (!request.IsBlankTemplate && !string.IsNullOrWhiteSpace(request.SignatoryName))
                        {
                            sigCol.Item().Width(220).AlignCenter().Text(request.SignatoryName).Bold().FontSize(8.5f);
                        }
                        sigCol.Item().Width(220).BorderBottom(1).BorderColor(Colors.Black).Text("");
                        sigCol.Item().Width(220).AlignCenter().Text("Printed Name/Signature").FontSize(7.5f);
                    });
                });

                RenderStandardFooter(page);
            });

            // ══════════════════════════════════════════════════════════════════════
            // PAGE 3: SUPPLIER SIGN-OFF SHEET
            // ══════════════════════════════════════════════════════════════════════
            doc.Page(page =>
            {
                page.Size(PageSizes.A4.Portrait());
                page.Margin(1.5f, Unit.Centimetre);
                page.DefaultTextStyle(t => t.FontSize(8.5f).FontFamily("Arial"));

                page.Header().Column(col =>
                {
                    RenderHeaderLogo(col, logoBytes, request.ProcuringEntity, request.ProcuringEntityAddress);

                    col.Item().PaddingTop(10).Row(r =>
                    {
                        r.RelativeItem().Column(sc =>
                        {
                            sc.Item().Text(primarySupplier.SupplierName).Bold().FontSize(8.5f);
                            sc.Item().Text($"RFQ No. : {request.RFQNumber}").Bold().FontSize(8);
                            sc.Item().Text($"BAC RES. No: {request.BacResolutionNumber}").FontSize(7.5f);
                            sc.Item().Text($"PR No.: {request.PRNumber}").FontSize(7.5f);
                        });

                        r.RelativeItem().Column(rc =>
                        {
                            rc.Item().AlignRight().Text(!string.IsNullOrWhiteSpace(primarySupplier.ContactNumber) ? primarySupplier.ContactNumber : primarySupplier.Email).FontSize(8);
                            rc.Item().AlignRight().BorderBottom(0.5f).BorderColor(Colors.Black).Text("Cellphone/Contact No./address/E-mail").FontSize(7).Italic();
                            rc.Item().PaddingTop(8).AlignRight().Text($"Date: {request.Date}").FontSize(8);
                            rc.Item().AlignRight().BorderBottom(0.5f).BorderColor(Colors.Black).Text("Date").FontSize(7).Italic();
                        });
                    });
                });

                page.Content().PaddingTop(40).Column(col =>
                {
                    // Verification Stamp / Signatures area
                    col.Item().AlignRight().PaddingRight(20).Border(1.5f).BorderColor(Colors.Blue.Medium).Width(180).Height(80).Padding(6).Column(sc =>
                    {
                        sc.Item().AlignCenter().Text("RECEIVED & VERIFIED").Bold().FontSize(8).FontColor(Colors.Blue.Medium);
                        sc.Item().PaddingTop(16).AlignCenter().Text(request.BacSecName).FontSize(7.5f).FontColor(Colors.Blue.Medium);
                        sc.Item().AlignCenter().Text(request.Date).FontSize(7).FontColor(Colors.Blue.Medium);
                    });
                });

                RenderStandardFooter(page);
            });
        });

        return Task.FromResult(pdf.GeneratePdf());
    }

    private static void RenderHeaderLogo(ColumnDescriptor col, byte[]? logoBytes, string procuringEntity, string? address = null)
    {
        col.Item().Row(r =>
        {
            if (logoBytes != null && logoBytes.Length > 0)
            {
                r.AutoItem().Height(35).Image(logoBytes);
                r.RelativeItem().PaddingLeft(10).AlignMiddle().Column(c =>
                {
                    c.Item().Text(procuringEntity.ToUpper()).Bold().FontSize(10.5f);
                    if (!string.IsNullOrWhiteSpace(address) && !address.StartsWith("["))
                    {
                        c.Item().Text(address).FontSize(8);
                    }
                });
            }
            else
            {
                r.RelativeItem().AlignCenter().Column(c =>
                {
                    c.Item().Text(procuringEntity.ToUpper()).Bold().FontSize(10.5f);
                    if (!string.IsNullOrWhiteSpace(address) && !address.Trim().StartsWith("["))
                    {
                        c.Item().Text(address.Trim()).FontSize(8);
                    }
                });
            }
        });
    }

    private static void RenderStandardFooter(PageDescriptor page)
    {
        page.Footer().PaddingTop(4).Row(row =>
        {
            row.RelativeItem().Text("ERPEZ Procurement Management System").FontSize(7).Italic();
            row.RelativeItem().AlignRight().Text(t =>
            {
                t.Span("Page: ").FontSize(7);
                t.CurrentPageNumber().FontSize(7);
                t.Span(" of ").FontSize(7);
                t.TotalPages().FontSize(7);
            });
        });
    }

    private static IContainer NoticeTableHeaderCell(IContainer c) =>
        c.Border(0.5f).BorderColor(Colors.Black)
         .Background(Colors.Grey.Lighten3)
         .Padding(4)
         .AlignCenter()
         .AlignMiddle();

    private static IContainer NoticeTableCell(IContainer c) =>
        c.Border(0.5f).BorderColor(Colors.Black).Padding(4);
}

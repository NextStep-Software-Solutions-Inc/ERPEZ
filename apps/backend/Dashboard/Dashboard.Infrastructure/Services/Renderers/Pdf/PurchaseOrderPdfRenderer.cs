using System;
using System.Globalization;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.PurchaseOrders.DTOs;
using ERPEZ.Domain.Enums;
using ERPEZ.Infrastructure.Services.DocumentGeneration;
using ERPEZ.Infrastructure.Services.Renderers.Pdf.Base;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace ERPEZ.Infrastructure.Services.Renderers.Pdf;

/// <summary>
/// QuestPDF renderer for Philippine Government COA GAM Appendix 61 "PURCHASE ORDER" document.
/// </summary>
public sealed class PurchaseOrderPdfRenderer : BasePdfRenderer, IDocumentRenderer<PurchaseOrderDataDto>
{
    public DocumentType DocumentType => DocumentType.PurchaseOrder;
    public ExportFormat Format => ExportFormat.Pdf;

    public Task<byte[]> RenderAsync(
        PurchaseOrderDataDto request,
        CancellationToken cancellationToken = default)
    {
        var pdf = CreateDocument(request);
        return Task.FromResult(pdf.GeneratePdf());
    }

    public Document CreateDocument(PurchaseOrderDataDto request)
    {
        var phCulture = new CultureInfo("en-PH");

        return Document.Create(doc =>
        {
            doc.Page(page =>
            {
                page.Size(PageSizes.A4.Portrait());
                page.Margin(1.2f, Unit.Centimetre);
                page.DefaultTextStyle(t => t.FontSize(8.5f).FontFamily("Arial").LineHeight(1.25f));

                // ── Page Header ────────────────────────────────────────────
                page.Header().Column(col =>
                {
                    col.Item().AlignRight().Text("Appendix 61").FontSize(8.5f).Italic();

                    var entityName = !string.IsNullOrWhiteSpace(request.ProcuringEntityName) &&
                                     !request.ProcuringEntityName.Equals("USTP", StringComparison.OrdinalIgnoreCase) &&
                                     !request.ProcuringEntityName.Contains("SuperAdmin", StringComparison.OrdinalIgnoreCase) &&
                                     !request.ProcuringEntityName.Contains("Workspace", StringComparison.OrdinalIgnoreCase)
                        ? request.ProcuringEntityName
                        : "Agency Name";

                    if (request.LogoBytes != null && request.LogoBytes.Length > 0)
                    {
                        col.Item().Row(r =>
                        {
                            r.ConstantItem(48).Height(48).AlignMiddle().Image(request.LogoBytes).FitArea();

                            r.RelativeItem().PaddingLeft(12).AlignMiddle().Column(c =>
                            {
                                c.Item().Text("Republic of the Philippines").FontSize(8f).FontColor(Colors.Grey.Darken2);
                                c.Item().Text(entityName).Bold().FontSize(11.5f);

                                if (!string.IsNullOrWhiteSpace(request.ProcuringEntityAddress))
                                {
                                    c.Item().Text(request.ProcuringEntityAddress).FontSize(8f);
                                }
                            });
                        });

                        col.Item().PaddingTop(6).AlignCenter().Text("PURCHASE ORDER").Bold().FontSize(12.5f);
                    }
                    else
                    {
                        col.Item().AlignCenter().Text("Republic of the Philippines").FontSize(8f).FontColor(Colors.Grey.Darken2);
                        col.Item().AlignCenter().Text(entityName).Bold().FontSize(11.5f);

                        if (!string.IsNullOrWhiteSpace(request.ProcuringEntityAddress))
                        {
                            col.Item().AlignCenter().Text(request.ProcuringEntityAddress).FontSize(8f);
                        }

                        col.Item().PaddingTop(6).AlignCenter().Text("PURCHASE ORDER").Bold().FontSize(12.5f);
                    }

                    col.Item().PaddingTop(2).AlignCenter().MaxWidth(180).LineHorizontal(1.5f).LineColor(Colors.Black);
                });

                // ── Body Content ───────────────────────────────────────────
                page.Content().PaddingTop(6).Column(col =>
                {
                    // ── Box 1: Supplier & PO Info ──────────────────────────
                    col.Item().Border(1).BorderColor(Colors.Black).Table(infoTable =>
                    {
                        infoTable.ColumnsDefinition(c =>
                        {
                            c.RelativeColumn(1.2f); // Supplier details
                            c.RelativeColumn(1.0f); // PO details
                        });

                        infoTable.Cell().BorderRight(1).Padding(4).Column(sc =>
                        {
                            sc.Item().Text(t =>
                            {
                                t.Span("Supplier : ").FontSize(8);
                                t.Span(request.SupplierName).Bold().FontSize(8.5f);
                            });
                            sc.Item().PaddingTop(2).Text(t =>
                            {
                                t.Span("Address : ").FontSize(8);
                                t.Span(request.SupplierAddress).Bold().FontSize(8);
                            });
                            sc.Item().PaddingTop(2).Text(t =>
                            {
                                t.Span("TIN : ").FontSize(8);
                                t.Span(request.SupplierTIN).Bold().FontSize(8);
                            });
                            sc.Item().PaddingTop(2).Text(t =>
                            {
                                t.Span("Type Of PO : ").FontSize(8);
                                t.Span(request.TypeOfPO).Bold().FontSize(8);
                            });
                        });

                        infoTable.Cell().Padding(4).Column(pc =>
                        {
                            pc.Item().Text(t =>
                            {
                                t.Span("P.O. No. : ").FontSize(8);
                                t.Span(request.PONumber).Bold().FontSize(8.5f);
                            });
                            pc.Item().PaddingTop(2).Text(t =>
                            {
                                t.Span("Date : ").FontSize(8);
                                t.Span(request.Date?.ToString("yyyy-MM-dd") ?? "—").Bold().FontSize(8);
                            });
                            pc.Item().PaddingTop(2).Text(t =>
                            {
                                t.Span("Mode of Procurement : ").FontSize(8);
                                t.Span(request.ProcurementMode).Bold().FontSize(7.5f);
                            });
                        });
                    });

                    // ── Salutation & Directive ─────────────────────────────
                    col.Item().PaddingTop(6).PaddingBottom(4).Column(salutation =>
                    {
                        salutation.Item().Text("Gentlemen:").FontSize(8.5f);
                        salutation.Item().PaddingLeft(12)
                            .Text("Please furnish this Office the following articles subject to the terms and conditions contained herein:")
                            .FontSize(8.5f);
                    });

                    // ── Box 2: Delivery & Payment Terms ────────────────────
                    col.Item().Border(1).BorderColor(Colors.Black).Table(deliveryTable =>
                    {
                        deliveryTable.ColumnsDefinition(c =>
                        {
                            c.RelativeColumn(1.2f);
                            c.RelativeColumn(1.0f);
                        });

                        deliveryTable.Cell().BorderRight(1).Padding(4).Column(dc =>
                        {
                            dc.Item().Text(t =>
                            {
                                t.Span("Place of Delivery : ").FontSize(8);
                                t.Span(request.PlaceOfDelivery).Bold().FontSize(8);
                            });
                            dc.Item().PaddingTop(2).Text(t =>
                            {
                                t.Span("Date of Delivery : ").FontSize(8);
                                t.Span(request.DateOfDelivery?.ToString("yyyy-MM-dd") ?? "—").Bold().FontSize(8);
                            });
                        });

                        deliveryTable.Cell().Padding(4).Column(tc =>
                        {
                            tc.Item().Text(t =>
                            {
                                t.Span("Delivery Term : ").FontSize(8);
                                t.Span(request.DeliveryTerm).Bold().FontSize(8);
                            });
                            tc.Item().PaddingTop(2).Text(t =>
                            {
                                t.Span("Payment Term : ").FontSize(8);
                                t.Span(request.PaymentTerm).Bold().FontSize(8);
                            });
                        });
                    });

                    // ── Items Table ────────────────────────────────────────
                    col.Item().PaddingTop(4).Border(1).BorderColor(Colors.Black).Table(table =>
                    {
                        table.ColumnsDefinition(c =>
                        {
                            c.RelativeColumn(1.2f); // Stock / Property No
                            c.RelativeColumn(0.9f); // Unit
                            c.RelativeColumn(4.0f); // Description
                            c.RelativeColumn(0.9f); // Quantity
                            c.RelativeColumn(1.5f); // Unit Cost
                            c.RelativeColumn(1.5f); // Amount
                        });

                        table.Header(h =>
                        {
                            h.Cell().Element(POHeaderCell).Text("Stock/\nProperty No.").Bold().FontSize(7.5f);
                            h.Cell().Element(POHeaderCell).Text("Unit").Bold().FontSize(7.5f);
                            h.Cell().Element(POHeaderCell).Text("Description").Bold().FontSize(7.5f);
                            h.Cell().Element(POHeaderCell).Text("Quantity").Bold().FontSize(7.5f);
                            h.Cell().Element(POHeaderCell).Text("Unit Cost").Bold().FontSize(7.5f);
                            h.Cell().Element(POHeaderCell).Text("Amount").Bold().FontSize(7.5f);
                        });

                        foreach (var item in request.Items)
                        {
                            table.Cell().Element(PODataCell).AlignCenter().Text(item.ItemNumber.ToString()).FontSize(8);
                            table.Cell().Element(PODataCell).AlignCenter().Text(item.Unit).FontSize(8);
                            table.Cell().Element(PODataCell).Text(item.Description).Bold().FontSize(8);
                            table.Cell().Element(PODataCell).AlignCenter().Text(item.Quantity.ToString("0.00")).FontSize(8);
                            table.Cell().Element(PODataCell).AlignRight().Text($"₱ {item.UnitPrice.ToString("N2", phCulture)}").FontSize(8);
                            table.Cell().Element(PODataCell).AlignRight().Text($"₱ {item.Amount.ToString("N2", phCulture)}").FontSize(8);
                        }

                        // ***NOTHING FOLLOWS*** row
                        table.Cell().Element(PODataCell).AlignCenter().Text("-").FontSize(8);
                        table.Cell().Element(PODataCell).AlignCenter().Text("-").FontSize(8);
                        table.Cell().Element(PODataCell).AlignCenter().Text("***NOTHING FOLLOWS***").Bold().FontSize(8);
                        table.Cell().Element(PODataCell).AlignCenter().Text("-").FontSize(8);
                        table.Cell().Element(PODataCell).AlignCenter().Text("-").FontSize(8);
                        table.Cell().Element(PODataCell).AlignCenter().Text("-").FontSize(8);

                        // Total Row & Amount in Words
                        table.Cell().ColumnSpan(5).BorderTop(1).BorderColor(Colors.Black).Padding(4).Text(t =>
                        {
                            t.Span("Amount In Words: ").FontSize(7.5f);
                            t.Span(request.AmountInWords).Bold().FontSize(8);
                        });

                        table.Cell().BorderTop(1).BorderColor(Colors.Black).Padding(4).AlignRight()
                            .Text($"₱ {request.TotalAmount.ToString("N2", phCulture)}").Bold().FontSize(8.5f);
                    });

                    // ── Penalty Clause ─────────────────────────────────────
                    col.Item().PaddingTop(6).PaddingBottom(6)
                        .Text("In case of failure to make the full delivery within the time specified above, a penalty of one-tenth (1/10) of one percent for every day of delay shall be imposed on the undelivered item/s.")
                        .FontSize(7.5f).Justify();

                    // ── Signatories ────────────────────────────────────────
                    col.Item().PaddingTop(8).Table(sigTable =>
                    {
                        sigTable.ColumnsDefinition(c =>
                        {
                            c.RelativeColumn(1.0f); // Conforme
                            c.RelativeColumn(1.0f); // Very truly yours
                        });

                        // Left: Conforme
                        sigTable.Cell().PaddingRight(10).Column(c =>
                        {
                            c.Item().Text("Conforme:").Bold().FontSize(8.5f);
                            c.Item().PaddingTop(28).BorderTop(1).BorderColor(Colors.Black).AlignCenter()
                                .Text("Signature over Printed Name of Supplier").FontSize(7.5f);

                            c.Item().PaddingTop(16).MaxWidth(140).AlignCenter().BorderTop(1).BorderColor(Colors.Black).AlignCenter()
                                .Text("Date").FontSize(7.5f);
                        });

                        // Right: Very truly yours
                        sigTable.Cell().PaddingLeft(10).Column(c =>
                        {
                            c.Item().Text("Very truly yours,").Bold().FontSize(8.5f);
                            c.Item().PaddingTop(28).BorderTop(1).BorderColor(Colors.Black).AlignCenter()
                                .Text(string.IsNullOrWhiteSpace(request.ApprovedByName) ? "Signature over Printed Name of Authorized Official" : request.ApprovedByName)
                                .FontSize(7.5f);

                            c.Item().PaddingTop(16).MaxWidth(140).AlignCenter().BorderTop(1).BorderColor(Colors.Black).AlignCenter()
                                .Text(request.ApprovedByPosition).FontSize(7.5f);
                        });
                    });

                    // ── Box 3: Accounting & Funds Available ────────────────
                    col.Item().PaddingTop(10).Border(1).BorderColor(Colors.Black).Table(fundsTable =>
                    {
                        fundsTable.ColumnsDefinition(c =>
                        {
                            c.RelativeColumn(1.4f); // Funds Available
                            c.RelativeColumn(1.0f); // ORS / BURS
                        });

                        fundsTable.Cell().BorderRight(1).Padding(4).Column(fc =>
                        {
                            fc.Item().Text("Fund Cluster : ___________________________________").FontSize(7.5f);
                            fc.Item().PaddingTop(2).Text("Funds Available : _________________________________").FontSize(7.5f);

                            fc.Item().PaddingTop(26).BorderTop(1).BorderColor(Colors.Black).AlignCenter()
                                .Text("Signature over Printed Name of Chief Accountant/Head of Accounting Division/Unit").FontSize(7f);
                        });

                        fundsTable.Cell().Padding(4).Column(oc =>
                        {
                            oc.Item().Text("ORS/BURS No. : ______________________").FontSize(7.5f);
                            oc.Item().PaddingTop(2).Text("Date of the ORS/BURS: _______________").FontSize(7.5f);
                            oc.Item().PaddingTop(2).Text(t =>
                            {
                                t.Span("Amount : ").FontSize(7.5f);
                                t.Span($"₱ {request.TotalAmount.ToString("N2", phCulture)}").Bold().FontSize(8f);
                            });
                        });
                    });
                });
            });
        });
    }

    private static IContainer POHeaderCell(IContainer c) =>
        c.Border(0.5f).BorderColor(Colors.Black)
         .Background(Colors.White)
         .Padding(3)
         .AlignCenter()
         .AlignMiddle();

    private static IContainer PODataCell(IContainer c) =>
        c.BorderLeft(0.5f).BorderRight(0.5f).BorderColor(Colors.Black)
         .PaddingVertical(2)
         .PaddingHorizontal(4);
}

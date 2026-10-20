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

public sealed class AprPdfRenderer : BasePdfRenderer, IDocumentRenderer<AprDataDto>
{
    public DocumentType DocumentType => DocumentType.Apr;
    public ExportFormat Format => ExportFormat.Pdf;

    public Task<byte[]> RenderAsync(
        AprDataDto request,
        CancellationToken cancellationToken = default)
    {
        var phCulture = new CultureInfo("en-PH");

        var pdf = Document.Create(doc =>
        {
            doc.Page(page =>
            {
                page.Size(PageSizes.A4.Portrait());
                page.Margin(0.8f, Unit.Centimetre);
                page.DefaultTextStyle(t => t.FontSize(7.5f).FontFamily("Arial"));

                // ── Page Content ───────────────────────────────────────────
                page.Content().Column(col =>
                {
                    // ── 1. Top Meta Header & Letterhead ─────────────────────
                    col.Item().AlignRight().Text("FORM NO. 002").FontSize(8).Bold();

                    RenderAgencyHeader(
                        col,
                        request.ProcuringEntityName ?? request.RequestingAgencyName,
                        request.ProcuringEntityAddress ?? request.RequestingAgencyAddress,
                        request.LogoBytes,
                        appendixText: null,
                        documentTitle: "AGENCY PROCUREMENT REQUEST",
                        showUnderline: false,
                        titleFontSize: 11f);

                    // ── 2. Requesting Agency Box Grid ──────────────────────
                    col.Item().PaddingTop(3).Border(1).BorderColor(Colors.Black).Table(metaTable =>
                    {
                        metaTable.ColumnsDefinition(c =>
                        {
                            c.RelativeColumn(3.2f); // Agency Name, Address, Tel Nos
                            c.RelativeColumn(2.0f); // Acct Code, Control No
                        });

                        // Left Cell: Name & Address & Tel Nos
                        metaTable.Cell().RowSpan(2).BorderRight(1).BorderColor(Colors.Black).Padding(3).Column(c =>
                        {
                            c.Item().Text("NAME AND ADDRESS OF REQUESTING AGENCY:").FontSize(6.5f).Bold();

                            var cleanAgency = CleanEntityName(request.ProcuringEntityName ?? request.RequestingAgencyName);
                            var cleanAddr = !string.IsNullOrWhiteSpace(request.ProcuringEntityAddress)
                                ? request.ProcuringEntityAddress
                                : request.RequestingAgencyAddress;

                            c.Item().PaddingTop(1).Text(cleanAgency).FontSize(8f).SemiBold();
                            if (!string.IsNullOrWhiteSpace(cleanAddr))
                            {
                                c.Item().Text(cleanAddr).FontSize(7f);
                            }

                            if (!string.IsNullOrWhiteSpace(request.TelNos))
                            {
                                c.Item().PaddingTop(2).Text($"TEL. NOS. {request.TelNos}").FontSize(6.5f).Bold();
                            }
                        });

                        // Right Cell Top: Agency Acct Code
                        metaTable.Cell().BorderBottom(1).BorderColor(Colors.Black).Padding(3).Row(r =>
                        {
                            r.AutoItem().Text("AGENCY ACCT. CODE:").FontSize(6.5f).Bold();
                            r.RelativeItem().PaddingLeft(6).AlignMiddle().Text(string.IsNullOrWhiteSpace(request.AgencyAccountCode) ? "" : request.AgencyAccountCode).FontSize(7.5f).SemiBold();
                        });

                        // Right Cell Bottom: Agency Control No
                        metaTable.Cell().Padding(3).Row(r =>
                        {
                            r.AutoItem().Text("AGENCY CONTROL NO.:").FontSize(6.5f).Bold();
                            r.RelativeItem().PaddingLeft(6).AlignMiddle().Text(string.IsNullOrWhiteSpace(request.AgencyControlNumber) ? "" : request.AgencyControlNumber).FontSize(7.5f).SemiBold();
                        });
                    });

                    // ── 3. PS APR No. Bar ───────────────────────────────────
                    col.Item().BorderLeft(1).BorderRight(1).BorderBottom(1).BorderColor(Colors.Black).Padding(3).Row(r =>
                    {
                        r.AutoItem().Text("PS APR NO.:").FontSize(7.5f).Bold();
                        r.RelativeItem().PaddingLeft(6).Text(string.IsNullOrWhiteSpace(request.PSAprNumber) ? "" : request.PSAprNumber).FontSize(8).Bold();
                    });

                    // ── 4. To and Date Prepared ────────────────────────────
                    col.Item().PaddingTop(3).PaddingBottom(2).Row(r =>
                    {
                        r.RelativeItem(3.2f).Row(toRow =>
                        {
                            toRow.AutoItem().Text("To:").Bold().FontSize(8);
                            toRow.RelativeItem().PaddingLeft(4).Text(request.To).FontSize(8);
                        });

                        r.RelativeItem(2.0f).AlignRight().Column(dateCol =>
                        {
                            var dateStr = request.DatePrepared.HasValue ? request.DatePrepared.Value.ToString("yyyy-MM-dd") : "____________________";
                            dateCol.Item().AlignCenter().Text(dateStr).FontSize(8).Underline();
                            dateCol.Item().AlignCenter().Text("(Date Prepared)").FontSize(6.5f);
                        });
                    });

                    // ── 5. Action Requested Checklist ──────────────────────
                    col.Item().PaddingTop(1).AlignCenter().Text("PLEASE CHECK (√ ) APPROPRIATE BOX ON ACTION REQUESTED ON THE ITEM/S LISTED BELOW").Bold().FontSize(7.5f);

                    col.Item().PaddingTop(2).Border(0.5f).BorderColor(Colors.Black).Padding(3).Column(checkCol =>
                    {
                        // Row A: Common use supplies
                        var commonUseCheck = request.IsCommonUseSupplies ? "✔" : " ";
                        checkCol.Item().Row(r =>
                        {
                            r.AutoItem().Text($"[{commonUseCheck}]").Bold().FontSize(7.5f);
                            r.RelativeItem().PaddingLeft(3).Text($"Please issue common-use supplies/materials per Price List No. {(string.IsNullOrWhiteSpace(request.PriceListNumber) ? "__________________________" : request.PriceListNumber)} dated {(string.IsNullOrWhiteSpace(request.PriceListDate) ? "__________________________" : request.PriceListDate)}").FontSize(7);
                        });

                        // Delivery mode line
                        var fastLaneCheck = request.ModeOfDelivery == APRModeOfDelivery.FastLane ? "✔" : " ";
                        var schedCheck = request.ModeOfDelivery == APRModeOfDelivery.ScheduledPickUp ? "✔" : " ";
                        var dtdCheck = request.ModeOfDelivery == APRModeOfDelivery.DoorToDoor ? "✔" : " ";

                        checkCol.Item().PaddingLeft(14).PaddingTop(1).Row(r =>
                        {
                            r.AutoItem().Text("Mode of delivery:").SemiBold().FontSize(7);
                            r.AutoItem().PaddingLeft(6).Text($"[{fastLaneCheck}] Pick-up (Fast Lane)").FontSize(7);
                            r.AutoItem().PaddingLeft(8).Text($"[{schedCheck}] Pick-up (Schedule)").FontSize(7);
                            r.AutoItem().PaddingLeft(8).Text($"[{dtdCheck}] Delivery (door-to-door)").FontSize(7);
                        });

                        // Insufficient funds line
                        var reduceCheck = request.InsufficientFundsAction == APRInsufficientFundsAction.ReduceQuantity ? "✔" : " ";
                        var billCheck = request.InsufficientFundsAction == APRInsufficientFundsAction.BillUs ? "✔" : " ";
                        var chargeCheck = request.InsufficientFundsAction == APRInsufficientFundsAction.ChargeToUnutilizedDeposit ? "✔" : " ";

                        checkCol.Item().PaddingLeft(14).PaddingTop(1).Row(r =>
                        {
                            r.AutoItem().Text("In case fund is not sufficient:").SemiBold().FontSize(7);
                            r.AutoItem().PaddingLeft(4).Text($"[{reduceCheck}] Reduce Quantity").FontSize(7);
                            r.AutoItem().PaddingLeft(6).Text($"[{billCheck}] Bill Us").FontSize(7);
                            r.AutoItem().PaddingLeft(6).Text($"[{chargeCheck}] Charge to Unutilized Deposit, APR No.: {(string.IsNullOrWhiteSpace(request.ChargeToUnutilizedDepositAprNumber) ? "__________" : request.ChargeToUnutilizedDepositAprNumber)} Date: {(string.IsNullOrWhiteSpace(request.ChargeToUnutilizedDepositDate) ? "__________" : request.ChargeToUnutilizedDepositDate)}").FontSize(7);
                        });

                        // Row B: Non-common items
                        var nonCommonCheck = request.IsNonCommonItems ? "✔" : " ";
                        checkCol.Item().PaddingTop(3).Row(r =>
                        {
                            r.AutoItem().Text($"[{nonCommonCheck}]").Bold().FontSize(7.5f);
                            r.RelativeItem().PaddingLeft(3).Text("Please purchase for our agency non-common items. Attached herewith :").FontSize(7);
                        });

                        var specCheck = request.RequiresCompleteSpecifications ? "✔" : " ";
                        var obrCheck = request.RequiresObR ? "✔" : " ";
                        var cbaCheck = request.RequiresCBA ? "✔" : " ";
                        var payCheck = request.RequiresPayment ? "✔" : " ";

                        checkCol.Item().PaddingLeft(14).PaddingTop(1).Row(r =>
                        {
                            r.AutoItem().Text($"[{specCheck}] Complete Specifications").FontSize(7);
                            r.AutoItem().PaddingLeft(10).Text($"[{obrCheck}] Obligation Request (ObR)").FontSize(7);
                            r.AutoItem().PaddingLeft(10).Text($"Others, pls. specify: {(string.IsNullOrWhiteSpace(request.OthersSpecify) ? "______________________" : request.OthersSpecify)}").FontSize(7);
                        });

                        checkCol.Item().PaddingLeft(14).PaddingTop(1).Row(r =>
                        {
                            r.AutoItem().Text($"[{cbaCheck}] Certificate of Budget Allocation (CBA)").FontSize(7);
                            r.AutoItem().PaddingLeft(10).Text($"[{payCheck}] Payment _______________________________").FontSize(7);
                        });

                        // Explanatory Note Box
                        checkCol.Item().PaddingTop(3).AlignCenter().Column(nc =>
                        {
                            nc.Item().AlignCenter().Text("This form shall be prepared for requisitions of Common-Use goods from the PS Depots & Sub-Depots; and for orders of\nConsumables & Non-Common Use Supplies from the PS Main.").Italic().FontSize(6.5f);
                            nc.Item().AlignCenter().Text("For PS Main-Common Use Supplies, please use Form 001 R or Form 001 B").Bold().FontSize(6.5f);
                        });
                    });

                    // ── 6. Items Table ─────────────────────────────────────
                    col.Item().PaddingTop(3).Border(1).BorderColor(Colors.Black).Table(table =>
                    {
                        table.ColumnsDefinition(c =>
                        {
                            c.RelativeColumn(0.6f); // ITEM No.
                            c.RelativeColumn(3.8f); // ITEM AND DESCRIPTION/SPECIFICATIONS/STOCK No.
                            c.RelativeColumn(0.9f); // QUANTITY
                            c.RelativeColumn(0.8f); // UNIT
                            c.RelativeColumn(1.1f); // UNIT PRICE
                            c.RelativeColumn(1.2f); // AMOUNT
                        });

                        // Header
                        table.Header(h =>
                        {
                            h.Cell().Element(TableDataCell).AlignCenter().Text("ITEM\nNo.").Bold().FontSize(6.5f);
                            h.Cell().Element(TableDataCell).AlignCenter().Text("ITEM AND DESCRIPTION/SPECIFICATIONS/STOCK No.").Bold().FontSize(6.5f);
                            h.Cell().Element(TableDataCell).AlignCenter().Text("QUANTITY").Bold().FontSize(6.5f);
                            h.Cell().Element(TableDataCell).AlignCenter().Text("UNIT").Bold().FontSize(6.5f);
                            h.Cell().Element(TableDataCell).AlignCenter().Text("UNIT PRICE").Bold().FontSize(6.5f);
                            h.Cell().Element(TableDataCell).AlignCenter().Text("AMOUNT").Bold().FontSize(6.5f);
                        });

                        // Data rows
                        foreach (var item in request.Items)
                        {
                            table.Cell().Element(TableDataCell).AlignCenter().Text(item.ItemNo.ToString()).FontSize(7);
                            table.Cell().Element(TableDataCell).Text(item.Description).FontSize(7);
                            table.Cell().Element(TableDataCell).AlignCenter().Text(item.Quantity.ToString()).FontSize(7);
                            table.Cell().Element(TableDataCell).AlignCenter().Text(item.Unit).FontSize(7);
                            table.Cell().Element(TableDataCell).AlignRight().Text(item.UnitPrice.ToString("N2", phCulture)).FontSize(7);
                            table.Cell().Element(TableDataCell).AlignRight().Text(item.Amount.ToString("N2", phCulture)).FontSize(7);
                        }

                        // Fill empty rows to maintain full page appearance
                        var totalRowsRendered = request.Items.Count;
                        var minRows = Math.Max(12, 18 - totalRowsRendered);
                        for (int i = 0; i < minRows; i++)
                        {
                            table.Cell().Element(TableDataCell).Text("");
                            table.Cell().Element(TableDataCell).Text("");
                            table.Cell().Element(TableDataCell).Text("");
                            table.Cell().Element(TableDataCell).Text("");
                            table.Cell().Element(TableDataCell).Text("");
                            table.Cell().Element(TableDataCell).Text("");
                        }

                        // Total Amount Row
                        table.Cell().ColumnSpan(5).Element(TableDataCell).AlignRight().PaddingRight(6)
                            .Text("TOTAL AMOUNT").Bold().FontSize(7.5f);
                        table.Cell().Element(TableDataCell).AlignRight()
                            .Text($"₱ {request.TotalAmount.ToString("N2", phCulture)}").Bold().FontSize(7.5f);
                    });

                    // ── 7. Signatures Section ──────────────────────────────
                    col.Item().BorderLeft(1).BorderRight(1).BorderBottom(1).BorderColor(Colors.Black).Column(sigCol =>
                    {
                        sigCol.Item().Padding(2).AlignCenter().Text("NOTE: ALL SIGNATURES MUST BE OVER PRINTED NAME").Bold().FontSize(6.5f);

                        sigCol.Item().BorderTop(1).BorderColor(Colors.Black).Table(sigTable =>
                        {
                            sigTable.ColumnsDefinition(c =>
                            {
                                c.RelativeColumn(1f);
                                c.RelativeColumn(1f);
                                c.RelativeColumn(1f);
                            });

                            // Box 1: Property/Supply Officer
                            sigTable.Cell().BorderRight(1).BorderColor(Colors.Black).Padding(3).Column(sc =>
                            {
                                sc.Item().Text("STOCKS REQUESTED ARE CERTIFIED TO BE\nWITHIN APPROVED PROGRAM:").SemiBold().FontSize(6);
                                sc.Item().PaddingTop(22).AlignCenter().Text(request.PropertyOfficer.PrintedName).Bold().FontSize(7.5f);
                                sc.Item().AlignCenter().BorderTop(0.5f).BorderColor(Colors.Black).PaddingTop(1).Text("AGENCY PROPERTY/SUPPLY OFFICER").FontSize(6).Bold();
                            });

                            // Box 2: Chief Accountant
                            sigTable.Cell().BorderRight(1).BorderColor(Colors.Black).Padding(3).Column(sc =>
                            {
                                sc.Item().Text("FUNDS CERTIFIED AVAILABLE:").SemiBold().FontSize(6);
                                sc.Item().PaddingTop(22).AlignCenter().Text(request.ChiefAccountant.PrintedName).Bold().FontSize(7.5f);
                                sc.Item().AlignCenter().BorderTop(0.5f).BorderColor(Colors.Black).PaddingTop(1).Text("AGENCY CHIEF ACCOUNTANT").FontSize(6).Bold();
                            });

                            // Box 3: Agency Head / Authorized
                            sigTable.Cell().Padding(3).Column(sc =>
                            {
                                sc.Item().Text("APPROVED:").SemiBold().FontSize(6);
                                sc.Item().PaddingTop(22).AlignCenter().Text(request.ApprovedBy.PrintedName).Bold().FontSize(7.5f);
                                sc.Item().AlignCenter().BorderTop(0.5f).BorderColor(Colors.Black).PaddingTop(1).Text("AGENCY HEAD/AUTHORIZED SIGNATURE").FontSize(6).Bold();
                            });
                        });
                    });

                    // ── 8. Bottom Deposit / Check Enclosed Box ─────────────
                    col.Item().BorderLeft(1).BorderRight(1).BorderBottom(1).BorderColor(Colors.Black).Padding(3).Column(fCol =>
                    {
                        var depCheck = request.FundsDepositedWithPs ? "✔" : " ";
                        var chkCheck = request.CheckEnclosed ? "✔" : " ";

                        fCol.Item().Row(r =>
                        {
                            r.AutoItem().Text($"[{depCheck}] FUNDS DEPOSITED WITH PS").FontSize(6.5f).Bold();
                            r.AutoItem().PaddingLeft(12).Text($"[{chkCheck}] {(string.IsNullOrWhiteSpace(request.CheckDetails) ? "___________________" : request.CheckDetails)} CHECK No. {(string.IsNullOrWhiteSpace(request.CheckNumber) ? "____________________" : request.CheckNumber)}").FontSize(6.5f).Bold();
                        });

                        fCol.Item().PaddingTop(2).Row(r =>
                        {
                            var amtStr = request.CheckAmount.HasValue ? request.CheckAmount.Value.ToString("N2", phCulture) : "_____________________";
                            r.AutoItem().Text("IN THE AMOUNT OF: ____________________________________________________________").FontSize(6.5f);
                            r.RelativeItem().AlignRight().Text($"(₱ {amtStr}) ENCLOSED").FontSize(6.5f).Bold();
                        });
                    });
                });
            });
        });

        return Task.FromResult(pdf.GeneratePdf());
    }
}

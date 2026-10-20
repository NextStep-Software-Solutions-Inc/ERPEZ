using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.DirectContractings.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Infrastructure.Services.DocumentGeneration;
using ERPEZ.Infrastructure.Services.Renderers.Pdf.Base;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace ERPEZ.Infrastructure.Services.Renderers.Pdf;

public sealed class DirectContractingPdfRenderer : BasePdfRenderer, IDocumentRenderer<DirectContractingPdfDataDto>
{
    public DocumentType DocumentType => DocumentType.DirectContracting;
    public ExportFormat Format => ExportFormat.Pdf;

    public Task<byte[]> RenderAsync(
        DirectContractingPdfDataDto request,
        CancellationToken cancellationToken = default)
    {
        var logoBytes = request.LogoBytes ?? LoadDefaultLogo();

        var pdf = Document.Create(doc =>
        {
            doc.Page(page =>
            {
                page.Size(PageSizes.A4.Portrait());
                page.Margin(1.5f, Unit.Centimetre);
                page.DefaultTextStyle(t => t.FontSize(9.5f).FontFamily("Arial").LineHeight(1.25f));

                // ── Institutional Header ──────────────────────────────────────────
                page.Header().Column(col =>
                {
                    RenderCenteredAgencyHeader(
                        col,
                        request.ProcuringEntityName ?? request.AgencyName,
                        request.ProcuringEntityAddress,
                        logoBytes,
                        officeName: request.AgencySubHeader,
                        documentTitle: request.DocumentTitle,
                        documentSubtitle: $"Control / DC No.: {request.DocumentControlNumber}",
                        titleFontSize: 12f,
                        alignment: request.LetterheadAlignment);
                });

                // ── Body Content ─────────────────────────────────────────────────
                page.Content().PaddingTop(10).Column(col =>
                {
                    // Section 1: Procurement & Supplier Profile
                    col.Item().Background(Colors.Grey.Lighten3).Padding(4).Row(r =>
                    {
                        r.RelativeItem().Text("SECTION 1: PROCUREMENT & EXCLUSIVE SUPPLIER PROFILE").Bold().FontSize(9.5f);
                    });

                    col.Item().PaddingTop(4).PaddingBottom(8).Table(table =>
                    {
                        table.ColumnsDefinition(c =>
                        {
                            c.RelativeColumn(1.8f);
                            c.RelativeColumn(3.2f);
                            c.RelativeColumn(1.8f);
                            c.RelativeColumn(3.2f);
                        });

                        // Row 1
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Background(Colors.Grey.Lighten4).Padding(3).Text("Procurement Project:").Bold().FontSize(9);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(3).Text(request.ProcurementProjectReference).FontSize(9);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Background(Colors.Grey.Lighten4).Padding(3).Text("Approved Budget (ABC):").Bold().FontSize(9);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(3).Text($"Php {request.ApprovedBudgetForContract:N2}").Bold().FontSize(9);

                        // Row 2
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Background(Colors.Grey.Lighten4).Padding(3).Text("Implementing Office:").Bold().FontSize(9);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(3).Text(!string.IsNullOrWhiteSpace(request.OfficeName) ? request.OfficeName : "End-User Unit").FontSize(9);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Background(Colors.Grey.Lighten4).Padding(3).Text("Date of Record:").Bold().FontSize(9);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(3).Text(request.Date.HasValue ? request.Date.Value.ToString("MMMM dd, yyyy") : DateTime.UtcNow.ToString("MMMM dd, yyyy")).FontSize(9);

                        // Row 3
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Background(Colors.Grey.Lighten4).Padding(3).Text("Exclusive Supplier:").Bold().FontSize(9);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(3).Text(request.Supplier.Name).Bold().FontSize(9);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Background(Colors.Grey.Lighten4).Padding(3).Text("TIN / PhilGEPS No.:").Bold().FontSize(9);
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(3).Text($"{request.Supplier.TINNumber} / {request.Supplier.PhilGEPSNumber}").FontSize(9);

                        // Row 4
                        table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Background(Colors.Grey.Lighten4).Padding(3).Text("Business Address:").Bold().FontSize(9);
                        table.Cell().ColumnSpan(3).Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(3).Text(request.Supplier.Address).FontSize(9);
                    });

                    // Section 2: Statutory Justification (RA 12009 Compliance)
                    col.Item().PaddingTop(6).Background(Colors.Grey.Lighten3).Padding(4).Row(r =>
                    {
                        r.RelativeItem().Text("SECTION 2: STATUTORY JUSTIFICATION & MARKET CONFIRMATION (RA 12009)").Bold().FontSize(9.5f);
                    });

                    col.Item().PaddingTop(4).PaddingBottom(8).Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(6).Column(justCol =>
                    {
                        justCol.Item().Text(t =>
                        {
                            t.Span("Legal Ground / Authority: ").Bold().FontSize(9);
                            t.Span(request.StatutoryGround).Bold().FontSize(9).FontColor(Colors.Blue.Darken3);
                        });

                        justCol.Item().PaddingTop(3).Text(t =>
                        {
                            t.Span("Statutory Standard: ").Bold().FontSize(9);
                            t.Span(request.StatutoryCitation).FontSize(9);
                        });

                        justCol.Item().PaddingTop(3).Text(t =>
                        {
                            t.Span("Market Scoping & Exclusivity Findings: ").Bold().FontSize(9);
                            t.Span(request.MarketScopingSummary).FontSize(9);
                        });

                        if (!string.IsNullOrWhiteSpace(request.ExclusivityVerification))
                        {
                            justCol.Item().PaddingTop(3).Text(t =>
                            {
                                t.Span("Verification of Exclusivity: ").Bold().FontSize(9);
                                t.Span(request.ExclusivityVerification).FontSize(9).Italic();
                            });
                        }

                        justCol.Item().PaddingTop(3).Text(t =>
                        {
                            t.Span("Committee Justification & Remarks: ").Bold().FontSize(9);
                            t.Span(request.JustificationRemarks).FontSize(9);
                        });
                    });

                    // Section 3: Itemized Specifications & Cost Breakdown
                    col.Item().PaddingTop(6).Background(Colors.Grey.Lighten3).Padding(4).Row(r =>
                    {
                        r.RelativeItem().Text("SECTION 3: ITEMIZED SPECIFICATIONS & COST BREAKDOWN").Bold().FontSize(9.5f);
                    });

                    col.Item().PaddingTop(4).PaddingBottom(8).Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.ConstantColumn(24);   // #
                            columns.RelativeColumn(3.5f); // Description & Specifications
                            columns.ConstantColumn(30);   // Qty
                            columns.ConstantColumn(32);   // Unit
                            columns.ConstantColumn(68);   // Unit ABC
                            columns.ConstantColumn(68);   // Quoted Unit Bid
                            columns.ConstantColumn(74);   // Total Bid
                            columns.ConstantColumn(64);   // Variance
                        });

                        // Repeating Header
                        table.Header(header =>
                        {
                            header.Cell().Element(TableHeaderCell).Text("#").Bold().FontSize(9);
                            header.Cell().Element(TableHeaderCell).Text("Item / Technical Specifications").Bold().FontSize(9);
                            header.Cell().Element(TableHeaderCell).Text("Qty").Bold().FontSize(9);
                            header.Cell().Element(TableHeaderCell).Text("Unit").Bold().FontSize(9);
                            header.Cell().Element(TableHeaderCell).Text("Unit ABC").Bold().FontSize(9);
                            header.Cell().Element(TableHeaderCell).Text("Quoted Bid").Bold().FontSize(9);
                            header.Cell().Element(TableHeaderCell).Text("Total Bid").Bold().FontSize(9);
                            header.Cell().Element(TableHeaderCell).Text("Variance").Bold().FontSize(9);
                        });

                        // Rows
                        int rowIdx = 1;
                        foreach (var item in request.Items)
                        {
                            var bg = rowIdx % 2 == 0 ? Colors.Grey.Lighten4 : Colors.White;

                            table.Cell().Background(bg).Element(TableDataCell).AlignCenter().Text(item.ItemNo.ToString()).FontSize(9);
                            
                            table.Cell().Background(bg).Element(TableDataCell).Column(desc =>
                            {
                                desc.Item().Text(item.ItemName).Bold().FontSize(9);
                                if (!string.IsNullOrWhiteSpace(item.Specifications) && item.Specifications != item.ItemName)
                                {
                                    desc.Item().Text(item.Specifications).FontSize(9).Italic();
                                }
                                if (!string.IsNullOrWhiteSpace(item.Brand) || !string.IsNullOrWhiteSpace(item.Model))
                                {
                                    var brandModel = $"{item.Brand} {item.Model}".Trim();
                                    desc.Item().Text($"Brand/Model: {brandModel}").FontSize(8.5f).FontColor(Colors.Grey.Darken2);
                                }
                            });

                            table.Cell().Background(bg).Element(TableDataCell).AlignCenter().Text(item.Quantity.ToString()).FontSize(9);
                            table.Cell().Background(bg).Element(TableDataCell).AlignCenter().Text(item.Unit).FontSize(9);
                            table.Cell().Background(bg).Element(TableDataCell).AlignRight().Text($"{item.UnitABC:N2}").FontSize(9);
                            table.Cell().Background(bg).Element(TableDataCell).AlignRight().Text($"{item.UnitBid:N2}").FontSize(9);
                            table.Cell().Background(bg).Element(TableDataCell).AlignRight().Text($"{item.TotalBid:N2}").Bold().FontSize(9);
                            
                            var varianceText = item.VarianceVsABC >= 0
                                ? $"({item.VarianceVsABC:N2})"
                                : $"-{Math.Abs(item.VarianceVsABC):N2}";
                            var varianceColor = item.VarianceVsABC >= 0 ? Colors.Green.Darken3 : Colors.Red.Darken2;

                            table.Cell().Background(bg).Element(TableDataCell).AlignRight().Text(varianceText).FontSize(9).FontColor(varianceColor);
                            rowIdx++;
                        }

                        // Summary Grand Total Row
                        var grandTotalABC = request.ApprovedBudgetForContract;
                        var grandTotalBid = request.TotalProposalAmount;
                        var totalVariance = grandTotalABC - grandTotalBid;

                        table.Cell().ColumnSpan(4).Background(Colors.Grey.Lighten3).Element(TableDataCell).AlignRight().Text("GRAND TOTAL:").Bold().FontSize(9.5f);
                        table.Cell().Background(Colors.Grey.Lighten3).Element(TableDataCell).AlignRight().Text($"Php {grandTotalABC:N2}").Bold().FontSize(9);
                        table.Cell().Background(Colors.Grey.Lighten3).Element(TableDataCell).AlignRight().Text("—").AlignCenter().FontSize(9);
                        table.Cell().Background(Colors.Grey.Lighten3).Element(TableDataCell).AlignRight().Text($"Php {grandTotalBid:N2}").Bold().FontSize(9.5f).FontColor(Colors.Blue.Darken3);
                        table.Cell().Background(Colors.Grey.Lighten3).Element(TableDataCell).AlignRight().Text($"Php {totalVariance:N2}").Bold().FontSize(9).FontColor(totalVariance >= 0 ? Colors.Green.Darken3 : Colors.Red.Darken2);
                    });

                    // Section 4: Signatures & Statutory Recommendation (Prevent page-break splits)
                    col.Item().ShowEntire().Column(sigBlock =>
                    {
                        sigBlock.Item().PaddingTop(4).Background(Colors.Grey.Lighten3).Padding(4).Row(r =>
                        {
                            r.RelativeItem().Text("SECTION 4: SIGNATURES & BAC RECOMMENDATION (RA 12009)").Bold().FontSize(9.5f);
                        });

                        sigBlock.Item().PaddingTop(4).Text(
                            "We hereby recommend the approval of Direct Contracting as an alternative mode of procurement pursuant to Section 35 of RA 12009 and declare the above specifications and proprietary justifications true and correct.")
                            .FontSize(9).Italic();

                        // BAC Committee Members Grid (2 columns)
                        sigBlock.Item().PaddingTop(10).Column(bacGrid =>
                        {
                            for (int i = 0; i < request.Signatories.Count; i += 2)
                            {
                                var left = request.Signatories[i];
                                var right = i + 1 < request.Signatories.Count ? request.Signatories[i + 1] : null;

                                bacGrid.Item().PaddingBottom(12).Row(row =>
                                {
                                    row.RelativeItem().Column(sc =>
                                    {
                                        if (!string.IsNullOrWhiteSpace(left.Name))
                                        {
                                            sc.Item().Text(left.Name.ToUpperInvariant()).Bold().FontSize(9.5f);
                                            sc.Item().Text(left.Position).FontSize(8.5f);
                                            sc.Item().Text(left.Role).FontSize(8).FontColor(Colors.Grey.Darken2);
                                        }
                                        else
                                        {
                                            sc.Item().PaddingTop(16).MaxWidth(170).LineHorizontal(1).LineColor(Colors.Black);
                                            sc.Item().PaddingTop(2).Text(left.Position).FontSize(8.5f);
                                        }
                                    });

                                    if (right != null)
                                    {
                                        row.RelativeItem().Column(sc =>
                                        {
                                            if (!string.IsNullOrWhiteSpace(right.Name))
                                            {
                                                sc.Item().Text(right.Name.ToUpperInvariant()).Bold().FontSize(9.5f);
                                                sc.Item().Text(right.Position).FontSize(8.5f);
                                                sc.Item().Text(right.Role).FontSize(8).FontColor(Colors.Grey.Darken2);
                                            }
                                            else
                                            {
                                                sc.Item().PaddingTop(16).MaxWidth(170).LineHorizontal(1).LineColor(Colors.Black);
                                                sc.Item().PaddingTop(2).Text(right.Position).FontSize(8.5f);
                                            }
                                        });
                                    }
                                    else
                                    {
                                        row.RelativeItem();
                                    }
                                });
                            }
                        });

                        // Recommending BAC Secretariat & Chairperson
                        sigBlock.Item().PaddingTop(8).LineHorizontal(0.5f).LineColor(Colors.Grey.Lighten2);

                        sigBlock.Item().PaddingTop(6).Row(recRow =>
                        {
                            recRow.RelativeItem().Column(sec =>
                            {
                                sec.Item().Text("Prepared / Certified by:").FontSize(8.5f).Italic();
                                if (!string.IsNullOrWhiteSpace(request.BacSecretariatHeadName))
                                {
                                    sec.Item().PaddingTop(12).Text(request.BacSecretariatHeadName.ToUpperInvariant()).Bold().FontSize(9.5f);
                                    sec.Item().Text(request.BacSecretariatHeadTitle).FontSize(8.5f);
                                }
                                else
                                {
                                    sec.Item().PaddingTop(20).MaxWidth(170).LineHorizontal(1).LineColor(Colors.Black);
                                    sec.Item().PaddingTop(2).Text(request.BacSecretariatHeadTitle).FontSize(8.5f);
                                }
                            });

                            recRow.RelativeItem().Column(head =>
                            {
                                head.Item().Text("Action of Head of the Procuring Entity:").FontSize(8.5f).Italic();
                                head.Item().PaddingTop(2).Row(boxRow =>
                                {
                                    boxRow.ConstantItem(85).Text("[   ] APPROVED").Bold().FontSize(8.5f);
                                    boxRow.ConstantItem(100).Text("[   ] DISAPPROVED").Bold().FontSize(8.5f);
                                });

                                if (!string.IsNullOrWhiteSpace(request.HeadOfAgencyName))
                                {
                                    head.Item().PaddingTop(10).Text(request.HeadOfAgencyName.ToUpperInvariant()).Bold().FontSize(10);
                                    head.Item().Text(request.HeadOfAgencyTitle).FontSize(8.5f);
                                }
                                else
                                {
                                    head.Item().PaddingTop(18).MaxWidth(200).LineHorizontal(1).LineColor(Colors.Black);
                                    head.Item().PaddingTop(2).Text(request.HeadOfAgencyTitle).FontSize(8.5f);
                                }
                            });
                        });
                    });
                });

                // ── Running Page Footer ──────────────────────────────────────────
                page.Footer().Row(footer =>
                {
                    footer.RelativeItem().Text($"Generated under RA 12009 Standards | Direct Contracting Reference: {request.DocumentControlNumber}")
                        .FontSize(7.5f).FontColor(Colors.Grey.Darken1);

                    footer.RelativeItem().AlignRight().Text(t =>
                    {
                        t.Span("Page ").FontSize(8);
                        t.CurrentPageNumber().FontSize(8);
                        t.Span(" of ").FontSize(8);
                        t.TotalPages().FontSize(8);
                    });
                });
            });
        }).GeneratePdf();

        return Task.FromResult(pdf);
    }
}

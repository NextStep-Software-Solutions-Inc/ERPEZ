using ERPEZ.Application.Features.Planning.Document.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Infrastructure.Services.DocumentGeneration;
using ERPEZ.Infrastructure.Services.Renderers.Pdf.Base;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace ERPEZ.Infrastructure.Services.Renderers.Pdf;

public sealed class LibRealignmentPdfRenderer : BasePdfRenderer, IDocumentRenderer<LibRealignmentPdfDataDto>
{
    public DocumentType DocumentType => DocumentType.LibRealignment;
    public ExportFormat Format => ExportFormat.Pdf;

    private static readonly Color headerNavy = Color.FromHex("#002060");

    static LibRealignmentPdfRenderer()
    {
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public Task<byte[]> RenderAsync(
        LibRealignmentPdfDataDto request,
        CancellationToken cancellationToken = default)
    {
        var logoBytes = LoadDefaultLogo();

        var pdf = Document.Create(doc =>
        {
            doc.Page(page =>
            {
                page.Size(PageSizes.A4.Portrait());
                page.Margin(1.2f, Unit.Centimetre);
                page.DefaultTextStyle(t => t.FontSize(8).FontFamily("Arial"));

                // ── Repeating Page Header ───────────────────────────────────────
                page.Header().Element(h => RenderHeader(h, request, logoBytes));

                // ── Page Content ────────────────────────────────────────────────
                page.Content().PaddingTop(6).Column(col =>
                {
                    RenderFormTitle(col, request);
                    col.Item().PaddingTop(6);
                    RenderPart1(col, request);
                    col.Item().PaddingTop(8);
                    RenderPart2(col, request.Part2ApprovedBudget);
                    col.Item().PaddingTop(8);
                    RenderPart3(col, request.Part3ProposedModification);
                    col.Item().PaddingTop(12);
                    RenderSignatoriesGrid(col, request.Signatories);
                });

                // ── Repeating Page Footer ───────────────────────────────────────
                page.Footer().AlignRight().Text(t =>
                {
                    t.Span($"GIAMS 2022, (C) Copyright Digital Transformation Office {DateTime.Now:M/d/yyyy h:mm:ss tt} ").FontSize(7);
                    t.Span("Page: ").FontSize(7);
                    t.CurrentPageNumber().FontSize(7);
                    t.Span(" of ").FontSize(7);
                    t.TotalPages().FontSize(7);
                });
            });
        }).GeneratePdf();

        return Task.FromResult(pdf);
    }

    private static void RenderHeader(IContainer container, LibRealignmentPdfDataDto request, byte[]? logoBytes)
    {
        var effectiveLogo = (request.LogoBytes != null && request.LogoBytes.Length > 0)
            ? request.LogoBytes
            : logoBytes;

        container.Row(row =>
        {
            // Left: University / Agency Logo
            if (effectiveLogo != null && effectiveLogo.Length > 0)
            {
                row.ConstantItem(50).AlignMiddle().AlignCenter().Height(40).Image(effectiveLogo).FitArea();
            }

            var entityName = CleanEntityName(request.ProcuringEntityName ?? request.OrganizationName ?? request.AgencyName);

            // Middle: Dynamic Organization Name & Letterhead
            row.RelativeItem().PaddingLeft(6).PaddingRight(6).AlignMiddle().AlignCenter().Column(mid =>
            {
                mid.Item().AlignCenter().Text("Republic of the Philippines").FontSize(7.5f).FontColor(Colors.Grey.Darken2);
                mid.Item().AlignCenter().Text(entityName).Bold().FontSize(9.5f);
                if (!string.IsNullOrWhiteSpace(request.ProcuringEntityAddress))
                {
                    mid.Item().AlignCenter().Text(request.ProcuringEntityAddress).FontSize(7.5f).FontColor(Colors.Grey.Darken2);
                }
            });

            // Right: ISO Document Control Block
            row.ConstantItem(170).Border(1.5f).BorderColor(headerNavy).Column(iso =>
            {
                iso.Item().Background(headerNavy).Padding(2).AlignCenter()
                    .Text("Document Code No.").Bold().FontSize(7).FontColor(Colors.White);

                iso.Item().Padding(2).AlignCenter()
                    .Text(string.IsNullOrWhiteSpace(request.DocumentCode) ? "FM-SUC-FDP-002" : request.DocumentCode)
                    .Bold().FontSize(8);

                iso.Item().Row(r =>
                {
                    r.RelativeItem(1).BorderRight(1).BorderColor(headerNavy).Background(headerNavy).Padding(2).AlignCenter()
                        .Text("Rev. No.").Bold().FontSize(6.5f).FontColor(Colors.White);
                    r.RelativeItem(1.2f).BorderRight(1).BorderColor(headerNavy).Background(headerNavy).Padding(2).AlignCenter()
                        .Text("Effective Date").Bold().FontSize(6.5f).FontColor(Colors.White);
                    r.RelativeItem(1).Background(headerNavy).Padding(2).AlignCenter()
                        .Text("Page No.").Bold().FontSize(6.5f).FontColor(Colors.White);
                });

                iso.Item().Row(r =>
                {
                    r.RelativeItem(1).BorderRight(1).BorderColor(headerNavy).Padding(2).AlignCenter()
                        .Text(string.IsNullOrWhiteSpace(request.RevisionNo) ? "00" : request.RevisionNo).FontSize(8);
                    r.RelativeItem(1.2f).BorderRight(1).BorderColor(headerNavy).Padding(2).AlignCenter()
                        .Text(string.IsNullOrWhiteSpace(request.EffectiveDate) ? "—" : request.EffectiveDate).FontSize(8);
                    r.RelativeItem(1).Padding(2).AlignCenter()
                        .Text(t =>
                        {
                            t.CurrentPageNumber().FontSize(8);
                            t.Span(" of ").FontSize(8);
                            t.TotalPages().FontSize(8);
                        });
                });
            });
        });
    }

    private static void RenderFormTitle(ColumnDescriptor col, LibRealignmentPdfDataDto request)
    {
        col.Item().PaddingTop(4).AlignCenter().Text("MODIFICATION OF BUDGET").Bold().FontSize(11);
        col.Item().AlignCenter().Text($"FY {request.FiscalYear} BUDGET").Bold().FontSize(10);
        col.Item().PaddingTop(4).Text($"Delivery Unit/Office/: {request.DeliveryUnit}").Bold().FontSize(9);
    }

    private static void RenderPart1(ColumnDescriptor col, LibRealignmentPdfDataDto request)
    {
        col.Item().Text("Part 1. Reason for Modification of Budget (choose one and briefly explain the circumstances in the space provided)")
            .Bold().FontSize(8.5f);

        var reason = request.ReasonKey ?? string.Empty;
        var rawJustification = request.Justification?.Trim() ?? string.Empty;

        var isEnumNameEcho = string.Equals(rawJustification, "UnforeseenModification", StringComparison.OrdinalIgnoreCase) ||
                             string.Equals(rawJustification, "Reassessment", StringComparison.OrdinalIgnoreCase) ||
                             string.Equals(rawJustification, "AdditionalRequirements", StringComparison.OrdinalIgnoreCase) ||
                             string.Equals(rawJustification, reason.Trim(), StringComparison.OrdinalIgnoreCase);

        var hasExplanation = !string.IsNullOrWhiteSpace(rawJustification) && !isEnumNameEcho;
        var hasExplicitReason = !string.IsNullOrWhiteSpace(reason) &&
                                !reason.Equals("None", StringComparison.OrdinalIgnoreCase) &&
                                !reason.Equals("UnforeseenModification", StringComparison.OrdinalIgnoreCase) &&
                                !isEnumNameEcho;

        // If the user hasn't added a reason/justification yet, leave all checkboxes unchecked and text blank
        var isOpt1 = false;
        var isOpt2 = false;
        var isOpt3 = false;

        if (hasExplanation || hasExplicitReason)
        {
            isOpt1 = reason.Contains("unforeseen", StringComparison.OrdinalIgnoreCase);
            isOpt2 = reason.Contains("re-assessment", StringComparison.OrdinalIgnoreCase) ||
                     reason.Contains("reassessment", StringComparison.OrdinalIgnoreCase) ||
                     reason.Contains("prioritization", StringComparison.OrdinalIgnoreCase) ||
                     reason.Equals("Reassessment", StringComparison.OrdinalIgnoreCase);
            isOpt3 = reason.Contains("calamity", StringComparison.OrdinalIgnoreCase) ||
                     reason.Contains("additional requirements", StringComparison.OrdinalIgnoreCase) ||
                     reason.Equals("AdditionalRequirements", StringComparison.OrdinalIgnoreCase);

            if (!isOpt1 && !isOpt2 && !isOpt3 && hasExplanation)
            {
                isOpt1 = true;
            }
        }

        col.Item().PaddingTop(4).Column(c =>
        {
            // Option 1
            RenderReasonItem(c, isOpt1,
                "Unforeseen modification or adjustments in the Activity/Program/Initiative (API):",
                isOpt1 && hasExplanation ? rawJustification : null);

            // Option 2
            RenderReasonItem(c, isOpt2,
                "Re-assessment in the use. Prioritization and/or distribution of resources:",
                isOpt2 && hasExplanation ? rawJustification : null);

            // Option 3
            RenderReasonItem(c, isOpt3,
                "Additional requirements for an API in view of a declaration of a state of calamity:",
                isOpt3 && hasExplanation ? rawJustification : null);
        });
    }

    private static void RenderReasonItem(ColumnDescriptor col, bool isChecked, string label, string? justification)
    {
        col.Item().PaddingBottom(3).Column(c =>
        {
            c.Item().Row(r =>
            {
                r.ConstantItem(12).Height(12).Border(1).BorderColor(Colors.Black).Element(box =>
                {
                    if (isChecked)
                    {
                        box.Background(Colors.Black);
                    }
                });
                r.RelativeItem().PaddingLeft(6).Text(label).FontSize(8.5f);
            });

            if (isChecked && !string.IsNullOrWhiteSpace(justification))
            {
                c.Item().PaddingLeft(18).PaddingTop(2).Text(justification).Italic().FontSize(8.5f);
            }
        });
    }

    private static void RenderPart2(ColumnDescriptor col, LibRealignmentPart2Dto part2)
    {
        col.Item().Text("Part 2. Approved Line-Item Budget to be Modified").Bold().FontSize(9);
        col.Item().PaddingTop(2).Text($"Goal: {part2.Goal}").FontSize(8.5f);
        col.Item().Text($"PREXC: {part2.PrexcCodeAndTitle}").FontSize(8.5f);

        col.Item().PaddingTop(4).Table(table =>
        {
            table.ColumnsDefinition(c =>
            {
                c.RelativeColumn(3.5f); // Item of Expenditures
                c.RelativeColumn(1.2f); // Q1
                c.RelativeColumn(1.2f); // Q2
                c.RelativeColumn(1.2f); // Q3
                c.RelativeColumn(1.2f); // Q4
                c.RelativeColumn(1.4f); // Total
            });

            table.Header(h =>
            {
                h.Cell().Element(HeaderCell).Text("Item of Expenditures").Bold().AlignCenter();
                h.Cell().Element(HeaderCell).Text("Q1").Bold().AlignCenter();
                h.Cell().Element(HeaderCell).Text("Q2").Bold().AlignCenter();
                h.Cell().Element(HeaderCell).Text("Q3").Bold().AlignCenter();
                h.Cell().Element(HeaderCell).Text("Q4").Bold().AlignCenter();
                h.Cell().Element(HeaderCell).Text("Total").Bold().AlignCenter();
            });

            foreach (var act in part2.Activities)
            {
                // Activity Name (Spans entire row)
                table.Cell().ColumnSpan(6).Element(ActivityHeaderCell).Text(act.ActivityName).Bold().FontSize(8.5f);

                foreach (var item in act.Items)
                {
                    table.Cell().Element(DataCell).PaddingLeft(4).Text(item.ItemOfExpenditure).FontSize(8);
                    table.Cell().Element(DataCell).AlignRight().Text(item.Q1.ToString("#,##0.00")).FontSize(8);
                    table.Cell().Element(DataCell).AlignRight().Text(item.Q2.ToString("#,##0.00")).FontSize(8);
                    table.Cell().Element(DataCell).AlignRight().Text(item.Q3.ToString("#,##0.00")).FontSize(8);
                    table.Cell().Element(DataCell).AlignRight().Text(item.Q4.ToString("#,##0.00")).FontSize(8);
                    table.Cell().Element(DataCell).AlignRight().Text(item.Total.ToString("#,##0.00")).FontSize(8);
                }

                // API Sub-total
                table.Cell().Element(DataCell).AlignRight().Text("API Sub-total").Bold().FontSize(8);
                table.Cell().Element(DataCell).AlignRight().Text(act.SubTotalQ1.ToString("#,##0.00")).Bold().FontSize(8);
                table.Cell().Element(DataCell).AlignRight().Text(act.SubTotalQ2.ToString("#,##0.00")).Bold().FontSize(8);
                table.Cell().Element(DataCell).AlignRight().Text(act.SubTotalQ3.ToString("#,##0.00")).Bold().FontSize(8);
                table.Cell().Element(DataCell).AlignRight().Text(act.SubTotalQ4.ToString("#,##0.00")).Bold().FontSize(8);
                table.Cell().Element(DataCell).AlignRight().Text(act.SubTotal.ToString("#,##0.00")).Bold().FontSize(8);
            }

            // Part 2 TOTAL Row
            table.Cell().Element(DataCell).AlignRight().Text("TOTAL").Bold().FontSize(8.5f);
            table.Cell().Element(DataCell).AlignRight().Text(part2.TotalQ1.ToString("#,##0.00")).Bold().FontSize(8.5f);
            table.Cell().Element(DataCell).AlignRight().Text(part2.TotalQ2.ToString("#,##0.00")).Bold().FontSize(8.5f);
            table.Cell().Element(DataCell).AlignRight().Text(part2.TotalQ3.ToString("#,##0.00")).Bold().FontSize(8.5f);
            table.Cell().Element(DataCell).AlignRight().Text(part2.TotalQ4.ToString("#,##0.00")).Bold().FontSize(8.5f);
            table.Cell().Element(DataCell).AlignRight().Text(part2.GrandTotal.ToString("#,##0.00")).Bold().FontSize(8.5f);
        });
    }

    private static void RenderPart3(ColumnDescriptor col, LibRealignmentPart3Dto part3)
    {
        col.Item().Text("Part 3. Proposed Modification").Bold().FontSize(9);
        col.Item().PaddingTop(2).Text($"Goal: {part3.Goal}").FontSize(8.5f);
        col.Item().Text($"PREXC: {part3.PrexcCodeAndTitle}").FontSize(8.5f);

        // If exactly 1 activity, render the Activity label above the table (ISO template format)
        if (part3.Activities.Count == 1 && !string.IsNullOrWhiteSpace(part3.Activities[0].ActivityName))
        {
            col.Item().Text($"Activity: {part3.Activities[0].ActivityName}").Bold().FontSize(8.5f);
        }

        col.Item().PaddingTop(4).Table(table =>
        {
            table.ColumnsDefinition(c =>
            {
                c.RelativeColumn(3.5f); // Item of Expenditures
                c.RelativeColumn(1.2f); // Q1
                c.RelativeColumn(1.2f); // Q2
                c.RelativeColumn(1.2f); // Q3
                c.RelativeColumn(1.2f); // Q4
                c.RelativeColumn(1.4f); // Total
            });

            table.Header(h =>
            {
                h.Cell().Element(HeaderCell).Text("Item of Expenditures").Bold().AlignCenter();
                h.Cell().Element(HeaderCell).Text("Q1").Bold().AlignCenter();
                h.Cell().Element(HeaderCell).Text("Q2").Bold().AlignCenter();
                h.Cell().Element(HeaderCell).Text("Q3").Bold().AlignCenter();
                h.Cell().Element(HeaderCell).Text("Q4").Bold().AlignCenter();
                h.Cell().Element(HeaderCell).Text("Total").Bold().AlignCenter();
            });

            if (part3.Activities.Count == 0 && part3.Items.Count == 0)
            {
                table.Cell().ColumnSpan(6).Element(DataCell).PaddingVertical(12).AlignCenter()
                    .Text("No proposed modifications").Italic().FontSize(8.5f).FontColor(Colors.Grey.Darken1);

                // Part 3 TOTAL Row
                table.Cell().Element(DataCell).AlignRight().Text("TOTAL").Bold().FontSize(8.5f);
                table.Cell().Element(DataCell).AlignRight().Text("0.00").Bold().FontSize(8.5f);
                table.Cell().Element(DataCell).AlignRight().Text("0.00").Bold().FontSize(8.5f);
                table.Cell().Element(DataCell).AlignRight().Text("0.00").Bold().FontSize(8.5f);
                table.Cell().Element(DataCell).AlignRight().Text("0.00").Bold().FontSize(8.5f);
                table.Cell().Element(DataCell).AlignRight().Text("0.00").Bold().FontSize(8.5f);
                return;
            }

            if (part3.Activities.Count <= 1)
            {
                var itemsToRender = part3.Activities.Count == 1
                    ? part3.Activities[0].Items
                    : part3.Items;

                foreach (var item in itemsToRender)
                {
                    table.Cell().Element(DataCell).PaddingLeft(4).Text(item.ItemOfExpenditure).FontSize(8);
                    table.Cell().Element(DataCell).AlignRight().Text(item.Q1.ToString("#,##0.00")).FontSize(8);
                    table.Cell().Element(DataCell).AlignRight().Text(item.Q2.ToString("#,##0.00")).FontSize(8);
                    table.Cell().Element(DataCell).AlignRight().Text(item.Q3.ToString("#,##0.00")).FontSize(8);
                    table.Cell().Element(DataCell).AlignRight().Text(item.Q4.ToString("#,##0.00")).FontSize(8);
                    table.Cell().Element(DataCell).AlignRight().Text(item.Total.ToString("#,##0.00")).FontSize(8);
                }
            }
            else
            {
                // Multiple activities: render each activity with its subheader, items, and API Sub-total
                foreach (var act in part3.Activities)
                {
                    table.Cell().ColumnSpan(6).Element(ActivityHeaderCell).Text(act.ActivityName).Bold().FontSize(8.5f);

                    foreach (var item in act.Items)
                    {
                        table.Cell().Element(DataCell).PaddingLeft(4).Text(item.ItemOfExpenditure).FontSize(8);
                        table.Cell().Element(DataCell).AlignRight().Text(item.Q1.ToString("#,##0.00")).FontSize(8);
                        table.Cell().Element(DataCell).AlignRight().Text(item.Q2.ToString("#,##0.00")).FontSize(8);
                        table.Cell().Element(DataCell).AlignRight().Text(item.Q3.ToString("#,##0.00")).FontSize(8);
                        table.Cell().Element(DataCell).AlignRight().Text(item.Q4.ToString("#,##0.00")).FontSize(8);
                        table.Cell().Element(DataCell).AlignRight().Text(item.Total.ToString("#,##0.00")).FontSize(8);
                    }

                    // API Sub-total
                    table.Cell().Element(DataCell).AlignRight().Text("API Sub-total").Bold().FontSize(8);
                    table.Cell().Element(DataCell).AlignRight().Text(act.SubTotalQ1.ToString("#,##0.00")).Bold().FontSize(8);
                    table.Cell().Element(DataCell).AlignRight().Text(act.SubTotalQ2.ToString("#,##0.00")).Bold().FontSize(8);
                    table.Cell().Element(DataCell).AlignRight().Text(act.SubTotalQ3.ToString("#,##0.00")).Bold().FontSize(8);
                    table.Cell().Element(DataCell).AlignRight().Text(act.SubTotalQ4.ToString("#,##0.00")).Bold().FontSize(8);
                    table.Cell().Element(DataCell).AlignRight().Text(act.SubTotal.ToString("#,##0.00")).Bold().FontSize(8);
                }
            }

            // Part 3 TOTAL Row
            table.Cell().Element(DataCell).AlignRight().Text("TOTAL").Bold().FontSize(8.5f);
            table.Cell().Element(DataCell).AlignRight().Text(part3.TotalQ1.ToString("#,##0.00")).Bold().FontSize(8.5f);
            table.Cell().Element(DataCell).AlignRight().Text(part3.TotalQ2.ToString("#,##0.00")).Bold().FontSize(8.5f);
            table.Cell().Element(DataCell).AlignRight().Text(part3.TotalQ3.ToString("#,##0.00")).Bold().FontSize(8.5f);
            table.Cell().Element(DataCell).AlignRight().Text(part3.TotalQ4.ToString("#,##0.00")).Bold().FontSize(8.5f);
            table.Cell().Element(DataCell).AlignRight().Text(part3.ProposedGrandTotal.ToString("#,##0.00")).Bold().FontSize(8.5f);
        });
    }

    private static void RenderSignatoriesGrid(ColumnDescriptor col, List<LibRealignmentSignatoryDto> signatories)
    {
        var sig1 = signatories.ElementAtOrDefault(0) ?? new LibRealignmentSignatoryDto { Role = "[1] Submitted by:", Name = string.Empty, Designation = "Head of Office / Delivery Unit Head" };
        var sig2 = signatories.ElementAtOrDefault(1) ?? new LibRealignmentSignatoryDto { Role = "[2] Certified as to availability of budget:", Name = string.Empty, Designation = "Director, Financial Management Services" };
        var sig3 = signatories.ElementAtOrDefault(2) ?? new LibRealignmentSignatoryDto { Role = "[3] RECOMMENDING APPROVAL:", Name = string.Empty, Designation = "Chancellor" };
        var sig4 = signatories.ElementAtOrDefault(3) ?? new LibRealignmentSignatoryDto { Role = "[4] APPROVED:", Name = string.Empty, Designation = "President" };

        col.Item().ShowEntire().Column(c =>
        {
            // Row 1: Sig 1 and Sig 2
            c.Item().Row(r =>
            {
                r.RelativeItem().PaddingRight(20).Element(e => RenderSignatoryBox(e, sig1));
                r.RelativeItem().PaddingLeft(20).Element(e => RenderSignatoryBox(e, sig2));
            });

            c.Item().Height(25);

            // Row 2: Sig 3 and Sig 4
            c.Item().Row(r =>
            {
                r.RelativeItem().PaddingRight(20).Element(e => RenderSignatoryBox(e, sig3));
                r.RelativeItem().PaddingLeft(20).Element(e => RenderSignatoryBox(e, sig4));
            });
        });
    }

    private static void RenderSignatoryBox(IContainer container, LibRealignmentSignatoryDto sig)
    {
        container.Column(c =>
        {
            c.Item().Text(sig.Role).FontSize(8.5f);

            if (!string.IsNullOrWhiteSpace(sig.Name))
            {
                c.Item().Height(20);
                c.Item().AlignCenter().Text(sig.Name.ToUpperInvariant()).Bold().FontSize(9);
                c.Item().PaddingTop(2).AlignCenter().Text(sig.Designation).FontSize(8);
            }
            else
            {
                c.Item().Height(28);
                c.Item().PaddingHorizontal(20).BorderBottom(1).BorderColor(Colors.Black).Text(string.Empty);
                c.Item().PaddingTop(3).AlignCenter().Text(sig.Designation).FontSize(8);
            }
        });
    }

    private static IContainer HeaderCell(IContainer c) =>
        c.Border(0.5f).BorderColor(Colors.Black).Padding(3).AlignMiddle();

    private static IContainer ActivityHeaderCell(IContainer c) =>
        c.Border(0.5f).BorderColor(Colors.Black).Padding(3).AlignMiddle();

    private static IContainer DataCell(IContainer c) =>
        c.Border(0.5f).BorderColor(Colors.Black).Padding(2.5f).AlignMiddle();
}

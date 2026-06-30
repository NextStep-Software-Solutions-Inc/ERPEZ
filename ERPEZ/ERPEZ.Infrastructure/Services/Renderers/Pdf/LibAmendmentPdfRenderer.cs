using ERPEZ.Application.Features.Planning.Document.Commands.GenerateLIBAmendment;
using ERPEZ.Domain.Enums;
using ERPEZ.Infrastructure.Services.DocumentGeneration;
using ERPEZ.Infrastructure.Services.Renderers.Pdf.Base;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace ERPEZ.Infrastructure.Services.Renderers.Pdf;

internal sealed class LibAmendmentPdfRenderer : BasePdfRenderer, IDocumentRenderer<LibAmendmentDataDto>
{
    public DocumentType DocumentType => DocumentType.BudgetModification;
    public ExportFormat Format       => ExportFormat.Pdf;

    private static readonly PageSize legalLandscape = new(355.6f, 215.9f, Unit.Millimetre);

    public Task<byte[]> RenderAsync(
        LibAmendmentDataDto request,
        CancellationToken   cancellationToken = default)
    {
        var pdf = Document.Create(doc =>
        {
            doc.Page(page =>
            {
                page.Size(legalLandscape);
                page.Margin(1.5f, Unit.Centimetre);
                page.DefaultTextStyle(t => t.FontSize(8).FontFamily("Arial"));

                page.Header().Element(h => RenderHeader(h, request));

                page.Content().PaddingTop(10).Column(col =>
                {
                    RenderPart1(col, request);
                    col.Item().PaddingTop(10);
                    RenderPart2(col, request.ApprovedBudget, "PART 2. APPROVED LINE-ITEM BUDGET TO BE MODIFIED", showGrandTotal: true);
                    col.Item().PaddingTop(10);
                    RenderPart2(col, request.ProposedBudget, "PART 3. PROPOSED MODIFICATION", showGrandTotal: false);
                    col.Item().PaddingTop(15);
                    RenderSignatories(col, request);
                });

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

    private static void RenderHeader(IContainer container, LibAmendmentDataDto request)
    {
        container.Column(c =>
        {
            c.Item().Row(row =>
            {
                row.RelativeItem(3).Column(left =>
                {
                    left.Item().Text("MODIFICATION OF BUDGET").Bold().FontSize(12).AlignCenter();
                    left.Item().Text($"LIB Number: {request.LIBNumber}").FontSize(10).AlignCenter();
                    left.Item().Text($"Fiscal Year: {request.FiscalYear}").FontSize(10).AlignCenter();
                    left.Item().PaddingTop(5).Text($"Agency Details: {request.OfficeName}").Bold().FontSize(9);
                    left.Item().Text($"Delivery Unit / Office: {request.OfficeName}").Bold().FontSize(9);
                });

                row.RelativeItem(1)
                    .Border(1).BorderColor(Colors.Blue.Darken2)
                    .Column(docBox =>
                    {
                        docBox.Item().Background(Colors.Blue.Darken2).Padding(2).AlignCenter().Text("Document Code No.").Bold().FontSize(7).FontColor(Colors.White);
                        docBox.Item().Padding(2).AlignCenter().Text("FM-USTP-FDP-002").Bold().FontSize(8);
                        docBox.Item().Row(metaRow =>
                        {
                            metaRow.RelativeItem().BorderRight(1).BorderColor(Colors.Blue.Darken2).Background(Colors.Blue.Darken2).Padding(2).AlignCenter().Text("Rev. No").Bold().FontSize(6).FontColor(Colors.White);
                            metaRow.RelativeItem().BorderRight(1).BorderColor(Colors.Blue.Darken2).Background(Colors.Blue.Darken2).Padding(2).AlignCenter().Text("Effective Date").Bold().FontSize(6).FontColor(Colors.White);
                            metaRow.RelativeItem().Background(Colors.Blue.Darken2).Padding(2).AlignCenter().Text("Page No.").Bold().FontSize(6).FontColor(Colors.White);
                        });
                        docBox.Item().Row(metaRow =>
                        {
                            metaRow.RelativeItem().BorderRight(1).BorderColor(Colors.Blue.Darken2).Padding(2).AlignCenter().Text("00").FontSize(8);
                            metaRow.RelativeItem().BorderRight(1).BorderColor(Colors.Blue.Darken2).Padding(2).AlignCenter().Text("04.01.22").FontSize(8);
                            metaRow.RelativeItem().Padding(2).AlignCenter().Text(t => 
                            {
                                t.CurrentPageNumber().FontSize(8);
                                t.Span(" of ").FontSize(8);
                                t.TotalPages().FontSize(8);
                            });
                        });
                    });
            });
        });
    }

    private static void RenderCheckboxRow(ColumnDescriptor c, bool isChecked, string label)
    {
        c.Item().PaddingBottom(4).Row(r => 
        {
            r.ConstantItem(12).Height(12).Border(1).BorderColor(Colors.Black).AlignCenter().AlignMiddle()
                .Text(isChecked ? "X" : "").FontSize(8).Bold();
            r.RelativeItem().PaddingLeft(5).Text(label).FontSize(9);
        });
    }

    private static void RenderPart1(ColumnDescriptor col, LibAmendmentDataDto request)
    {
        col.Item().Text("PART 1. REASON FOR MODIFICATION").Bold().FontSize(10);
        
        col.Item().PaddingTop(4).Column(c =>
        {
            RenderCheckboxRow(c, request.ReasonCode == "UnforeseenModification", "Unforeseen modification or adjustments in the Activity/Program/Initiative (API)");
            RenderCheckboxRow(c, request.ReasonCode == "Reassessment", "Reassessment of priorities");
            RenderCheckboxRow(c, request.ReasonCode == "AdditionalRequirements", "Additional requirements for an API");
            
            c.Item().PaddingBottom(4).Row(r => 
            {
                r.ConstantItem(12).Height(12).Border(1).BorderColor(Colors.Black).AlignCenter().AlignMiddle()
                    .Text(request.ReasonCode == "Others" ? "X" : "").FontSize(8).Bold();
                r.AutoItem().PaddingLeft(5).Text("Others:").FontSize(9);
                r.RelativeItem().PaddingLeft(5).BorderBottom(1).BorderColor(Colors.Black).Text(request.ReasonCode == "Others" ? request.Justification : "").FontSize(9);
            });
        });

        if (request.ReasonCode != "Others")
        {
            col.Item().PaddingTop(5).Text("Justification / Circumstances:").Bold().FontSize(9);
            col.Item().PaddingTop(2).Border(1).BorderColor(Colors.Black).Padding(4).Text(request.Justification).FontSize(9);
        }
    }

    private static void RenderPart2(ColumnDescriptor col, BudgetSectionDto budgetPart, string title, bool showGrandTotal)
    {
        col.Item().Text(title).Bold().FontSize(10);
        col.Item().PaddingTop(2).Text($"Goal: {budgetPart.Goal}").FontSize(9);
        col.Item().Text($"PREXC: {budgetPart.PREXC}").FontSize(9);

        col.Item().PaddingTop(5).Table(table =>
        {
            table.ColumnsDefinition(c =>
            {
                c.RelativeColumn(3f);
                c.RelativeColumn(1f);
                c.RelativeColumn(1f);
                c.RelativeColumn(1f);
                c.RelativeColumn(1f);
                c.RelativeColumn(1.2f);
            });

            table.Header(h =>
            {
                h.Cell().Element(TableHeaderCell).Text("ITEM OF EXPENDITURE").Bold();
                h.Cell().Element(TableHeaderCell).Text("Q1").Bold().AlignCenter();
                h.Cell().Element(TableHeaderCell).Text("Q2").Bold().AlignCenter();
                h.Cell().Element(TableHeaderCell).Text("Q3").Bold().AlignCenter();
                h.Cell().Element(TableHeaderCell).Text("Q4").Bold().AlignCenter();
                h.Cell().Element(TableHeaderCell).Text("TOTAL").Bold().AlignCenter();
            });

            foreach (var apiGroup in budgetPart.ApiGroups)
            {
                table.Cell().ColumnSpan(6).Element(TableGroupCell).Text(apiGroup.ActivityName).Bold().FontSize(9);

                foreach (var item in apiGroup.Expenses)
                {
                    table.Cell().Element(TableDataCell).PaddingLeft(10).Text(item.ExpenseItemName).FontSize(8);
                    table.Cell().Element(TableDataCell).AlignRight().Text($"{item.Q1Budget:N2}").FontSize(8);
                    table.Cell().Element(TableDataCell).AlignRight().Text($"{item.Q2Budget:N2}").FontSize(8);
                    table.Cell().Element(TableDataCell).AlignRight().Text($"{item.Q3Budget:N2}").FontSize(8);
                    table.Cell().Element(TableDataCell).AlignRight().Text($"{item.Q4Budget:N2}").FontSize(8);
                    table.Cell().Element(TableDataCell).AlignRight().Text($"{item.TotalBudget:N2}").Bold().FontSize(8);
                }

                table.Cell().ColumnSpan(1).Element(TableDataCell).AlignRight().Text("API Sub-total").Bold().FontSize(8);
                table.Cell().Element(TableDataCell).AlignRight().Text($"{apiGroup.Expenses.Sum(e => e.Q1Budget):N2}").Bold().FontSize(8);
                table.Cell().Element(TableDataCell).AlignRight().Text($"{apiGroup.Expenses.Sum(e => e.Q2Budget):N2}").Bold().FontSize(8);
                table.Cell().Element(TableDataCell).AlignRight().Text($"{apiGroup.Expenses.Sum(e => e.Q3Budget):N2}").Bold().FontSize(8);
                table.Cell().Element(TableDataCell).AlignRight().Text($"{apiGroup.Expenses.Sum(e => e.Q4Budget):N2}").Bold().FontSize(8);
                table.Cell().Element(TableDataCell).AlignRight().Text($"{apiGroup.SubTotal:N2}").Bold().FontSize(8);
            }

            if (showGrandTotal)
            {
                table.Cell().ColumnSpan(1).Element(TableDataCell).AlignRight().Text("TOTAL").Bold().FontSize(9);
                table.Cell().Element(TableDataCell).AlignRight().Text($"{budgetPart.ApiGroups.SelectMany(a => a.Expenses).Sum(e => e.Q1Budget):N2}").Bold().FontSize(9);
                table.Cell().Element(TableDataCell).AlignRight().Text($"{budgetPart.ApiGroups.SelectMany(a => a.Expenses).Sum(e => e.Q2Budget):N2}").Bold().FontSize(9);
                table.Cell().Element(TableDataCell).AlignRight().Text($"{budgetPart.ApiGroups.SelectMany(a => a.Expenses).Sum(e => e.Q3Budget):N2}").Bold().FontSize(9);
                table.Cell().Element(TableDataCell).AlignRight().Text($"{budgetPart.ApiGroups.SelectMany(a => a.Expenses).Sum(e => e.Q4Budget):N2}").Bold().FontSize(9);
                table.Cell().Element(TableDataCell).AlignRight().Text($"{budgetPart.GrandTotal:N2}").Bold().FontSize(9);
            }
        });
    }

    private static void RenderSignatories(ColumnDescriptor col, LibAmendmentDataDto request)
    {
        var signatories = request.Signatories;
        if (signatories is null || signatories.Count == 0) return;

        col.Item().PaddingTop(20).Column(c =>
        {
            c.Item().Row(r =>
            {
                r.RelativeItem().PaddingRight(10).Element(e => RenderSignatoryBox(e, signatories.ElementAtOrDefault(0), "Submitted by:"));
                r.RelativeItem().PaddingLeft(10).Element(e => RenderSignatoryBox(e, signatories.ElementAtOrDefault(1), "Certified as to availability of budget:"));
            });

            c.Item().Height(30);

            c.Item().Row(r =>
            {
                r.RelativeItem().PaddingRight(10).Element(e => RenderSignatoryBox(e, signatories.ElementAtOrDefault(2), "Recommending Approval:"));
                r.RelativeItem().PaddingLeft(10).Element(e => RenderSignatoryBox(e, signatories.ElementAtOrDefault(3), "Approved:"));
            });
        });
    }

    private static void RenderSignatoryBox(IContainer container, ERPEZ.Application.Common.Dtos.SignatoryDto? sig, string label)
    {
        container.Column(c =>
        {
            c.Item().Text(label).FontSize(9);
            c.Item().PaddingTop(30).BorderBottom(1).BorderColor(Colors.Black).PaddingBottom(2).Text(sig?.PrintedName?.ToUpperInvariant() ?? "").Bold().AlignCenter().FontSize(10);
            c.Item().PaddingTop(2).Text(sig?.Position ?? "").AlignCenter().FontSize(9);
        });
    }

    private static IContainer TableGroupCell(IContainer container) =>
        container.Border(1).BorderColor(Colors.Black).Background(Colors.Grey.Lighten3).Padding(2);
        
    private static new IContainer TableDataCell(IContainer container) =>
        container.Border(1).BorderColor(Colors.Black).Padding(2).AlignMiddle();
}

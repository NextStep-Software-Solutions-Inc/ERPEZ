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
                    RenderPart2(col, request.ApprovedBudget, "PART 2. APPROVED LINE-ITEM BUDGET TO BE MODIFIED");
                    col.Item().PaddingTop(10);
                    RenderPart2(col, request.ProposedBudget, "PART 3. PROPOSED MODIFICATION");
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
                            metaRow.RelativeItem().Background(Colors.Blue.Darken2).Padding(2).AlignCenter().Text("Rev. No").Bold().FontSize(6).FontColor(Colors.White);
                            metaRow.RelativeItem().Background(Colors.Blue.Darken2).Padding(2).AlignCenter().Text("Effective Date").Bold().FontSize(6).FontColor(Colors.White);
                        });
                        docBox.Item().Row(metaRow =>
                        {
                            metaRow.RelativeItem().Padding(2).AlignCenter().Text("00").FontSize(8);
                            metaRow.RelativeItem().Padding(2).AlignCenter().Text(DateTime.UtcNow.ToString("MM/dd/yy")).FontSize(8);
                        });
                    });
            });
        });
    }

    private static void RenderPart1(ColumnDescriptor col, LibAmendmentDataDto request)
    {
        col.Item().Text("PART 1. REASON FOR MODIFICATION").Bold().FontSize(10);
        col.Item().PaddingTop(2).Row(r =>
        {
            r.RelativeItem().Text(request.ReasonCode == "Realignment" ? "[X] Realignment" : "[ ] Realignment");
            r.RelativeItem().Text(request.ReasonCode == "Reallocation" ? "[X] Reallocation" : "[ ] Reallocation");
            r.RelativeItem().Text(request.ReasonCode == "Augmentation" ? "[X] Augmentation" : "[ ] Augmentation");
            r.RelativeItem().Text(request.ReasonCode == "Others" ? "[X] Others" : "[ ] Others");
        });
        col.Item().PaddingTop(5).Text("Justification / Circumstances:").Bold();
        col.Item().PaddingTop(2).Text(request.Justification).FontSize(9);
    }

    private static void RenderPart2(ColumnDescriptor col, BudgetSectionDto budgetPart, string title)
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
                    table.Cell().Element(TableDataCell).Text(item.ExpenseItemName);
                    table.Cell().Element(TableDataCell).AlignRight().Text($"{item.Q1Budget:N2}");
                    table.Cell().Element(TableDataCell).AlignRight().Text($"{item.Q2Budget:N2}");
                    table.Cell().Element(TableDataCell).AlignRight().Text($"{item.Q3Budget:N2}");
                    table.Cell().Element(TableDataCell).AlignRight().Text($"{item.Q4Budget:N2}");
                    table.Cell().Element(TableDataCell).AlignRight().Text($"{item.TotalBudget:N2}").Bold();
                }

                table.Cell().ColumnSpan(1).Element(TableDataCell).AlignRight().Text("Subtotal").Bold();
                table.Cell().Element(TableDataCell).AlignRight().Text($"{apiGroup.Expenses.Sum(e => e.Q1Budget):N2}").Bold();
                table.Cell().Element(TableDataCell).AlignRight().Text($"{apiGroup.Expenses.Sum(e => e.Q2Budget):N2}").Bold();
                table.Cell().Element(TableDataCell).AlignRight().Text($"{apiGroup.Expenses.Sum(e => e.Q3Budget):N2}").Bold();
                table.Cell().Element(TableDataCell).AlignRight().Text($"{apiGroup.Expenses.Sum(e => e.Q4Budget):N2}").Bold();
                table.Cell().Element(TableDataCell).AlignRight().Text($"{apiGroup.SubTotal:N2}").Bold();
            }
        });
    }

    private static void RenderSignatories(ColumnDescriptor col, LibAmendmentDataDto request)
    {
        col.Item().Row(row =>
        {
            var sigCount = request.Signatories?.Count ?? 0;
            if (sigCount == 0) return;

            var labels = new[]
            {
                "Submitted by:",
                "Certified as to availability of budget:",
                "Recommending Approval:",
                "Approved:"
            };

            for (int i = 0; i < sigCount && i < 4; i++)
            {
                var sig = request.Signatories[i];
                var label = labels[i];
                row.RelativeItem().Column(c =>
                {
                    c.Item().Text(label).FontSize(8);
                    c.Item().PaddingTop(20).Text(sig.PrintedName?.ToUpperInvariant() ?? "").Bold().AlignCenter().FontSize(9);
                    c.Item().Text(sig.Position ?? "").AlignCenter().FontSize(8);
                });
            }
        });
    }

    private static IContainer TableGroupCell(IContainer container) =>
        container.Border(1).Background(Colors.Grey.Lighten3).Padding(2);
}

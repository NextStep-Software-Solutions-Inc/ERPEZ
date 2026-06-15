using ERPEZ.Application.Common.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Infrastructure.Services.DocumentGeneration;
using ERPEZ.Infrastructure.Services.Renderers.Pdf.Base;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace ERPEZ.Infrastructure.Services.Renderers.Pdf;

internal sealed class LibPdfRenderer : BasePdfRenderer, IDocumentRenderer<LibDataDto>
{
    public DocumentType DocumentType => DocumentType.Lib;
    public ExportFormat Format       => ExportFormat.Pdf;

    // Legal Landscape: 355.6 mm × 215.9 mm
    private static readonly PageSize legalLandscape =
        new(355.6f, 215.9f, Unit.Millimetre);

    public Task<byte[]> RenderAsync(
        LibDataDto        request,
        CancellationToken cancellationToken = default)
    {
        var pdf = Document.Create(doc =>
        {
            doc.Page(page =>
            {
                page.Size(legalLandscape);
                page.Margin(1.5f, Unit.Centimetre);
                page.DefaultTextStyle(t => t.FontSize(7).FontFamily("Arial"));

                page.Header().Column(h =>
                {
                    // ── Title row with Document Code box ───────────────────────────
                    h.Item().Row(titleRow =>
                    {
                        titleRow.RelativeItem(3)
                            .Column(left =>
                            {
                                left.Item().AlignCenter()
                                    .Text("LINE ITEM BUDGET FORM")
                                    .Bold().FontSize(10);
                                left.Item().AlignCenter()
                                    .Text($"FOR FISCAL YEAR {request.FiscalYear}")
                                    .Bold().FontSize(9);
                            });

                        titleRow.RelativeItem(1)
                            .Border(1).BorderColor(Colors.Blue.Darken2)
                            .Column(docBox =>
                            {
                                docBox.Item()
                                    .Background(Colors.Blue.Darken2)
                                    .Padding(2)
                                    .AlignCenter()
                                    .Text("Document Code No.")
                                    .Bold().FontSize(6).FontColor(Colors.White);

                                docBox.Item()
                                    .Padding(2).AlignCenter()
                                    .Text("FM-USTP-FDP-01")
                                    .Bold().FontSize(7);

                                docBox.Item().Row(metaRow =>
                                {
                                    metaRow.RelativeItem()
                                        .Background(Colors.Blue.Darken2)
                                        .Padding(2).AlignCenter()
                                        .Text("Rev. No").Bold().FontSize(6).FontColor(Colors.White);
                                    metaRow.RelativeItem()
                                        .Background(Colors.Blue.Darken2)
                                        .Padding(2).AlignCenter()
                                        .Text("Effective Date").Bold().FontSize(6).FontColor(Colors.White);
                                    metaRow.RelativeItem()
                                        .Background(Colors.Blue.Darken2)
                                        .Padding(2).AlignCenter()
                                        .Text("Page No.").Bold().FontSize(6).FontColor(Colors.White);
                                });

                                docBox.Item().Row(metaRow =>
                                {
                                    metaRow.RelativeItem().Padding(2).AlignCenter().Text("00").FontSize(7);
                                    metaRow.RelativeItem().Padding(2).AlignCenter().Text("10/01/21").FontSize(7);
                                    metaRow.RelativeItem().Padding(2).AlignCenter()
                                        .Text(t =>
                                        {
                                            t.CurrentPageNumber().FontSize(7);
                                            t.Span(" of ").FontSize(7);
                                            t.TotalPages().FontSize(7);
                                        });
                                });
                            });
                    });

                    // ── Agency block ────────────────────────────────────────────────
                    h.Item().PaddingTop(4).Column(agency =>
                    {
                        agency.Item().Text("AGENCY:").Bold().FontSize(8);
                        agency.Item().Text(request.OfficeName).Bold().FontSize(8);
                    });

                    // ── Indicative / Final status ───────────────────────────────────
                    var indicativeBox = !request.IsFinal ? "☑" : "☐";
                    var finalBox      =  request.IsFinal ? "☑" : "☐";
                    h.Item().PaddingTop(2)
                        .Text($"{indicativeBox} INDICATIVE     {finalBox} FINAL")
                        .FontSize(8);
                });

                page.Content().PaddingTop(6).Column(col =>
                {
                    RenderSectionI(col, request);
                    col.Item().PageBreak();
                    RenderSectionII(col, request);
                    col.Item().PageBreak();
                    RenderSectionIII(col, request);
                    RenderSectionV(col, request);
                    RenderChart(col, request);
                    RenderSignatories(col, request.Signatories);
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

    // ─────────────────────────────────────────────────────────────────────────
    //  Section I — LINE ITEM BUDGET BY API (quarterly columns)
    // ─────────────────────────────────────────────────────────────────────────

    private static void RenderSectionI(ColumnDescriptor col, LibDataDto request)
    {
        col.Item().Text($"I. LINE ITEM BUDGET BY API {request.FiscalYear}")
            .Bold().FontSize(9);

        col.Item().PaddingTop(2).Text($"FUNDSOURCE: {request.FundCluster}")
            .FontSize(8);

        col.Item().PaddingTop(4).Table(table =>
        {
            // UACS Code | Particulars | Description | Q1 | Q2 | Q3 | Q4 | Total
            table.ColumnsDefinition(c =>
            {
                c.RelativeColumn(1.5f); // UACS Code
                c.RelativeColumn(3.5f); // Item of Expenditure
                c.RelativeColumn(3.0f); // Description
                c.RelativeColumn(1.5f); // Q1
                c.RelativeColumn(1.5f); // Q2
                c.RelativeColumn(1.5f); // Q3
                c.RelativeColumn(1.5f); // Q4
                c.RelativeColumn(2.0f); // Total
            });

            table.Header(h =>
            {
                SectionIHeader(h, "UACS Code");
                SectionIHeader(h, "Item of Expenditure");
                SectionIHeader(h, "Description");
                SectionIHeader(h, "1st Quarter");
                SectionIHeader(h, "2nd Quarter");
                SectionIHeader(h, "3rd Quarter");
                SectionIHeader(h, "4th Quarter");
                SectionIHeader(h, "TOTAL");
            });

            foreach (var apiGroup in request.ApiGroups)
            {
                // API / activity header row
                table.Cell().ColumnSpan(8).Element(ActivityHeaderCell)
                    .Text(apiGroup.ActivityName).Bold().FontSize(7);

                foreach (var expenseGroup in apiGroup.ExpenseGroups)
                {
                    // Expense class header row
                    table.Cell().ColumnSpan(8).Element(ExpenseClassHeaderCell)
                        .Text(expenseGroup.ExpenseClassName).Bold().FontSize(7);

                    // Detail rows
                    foreach (var row in expenseGroup.Rows)
                    {
                        table.Cell().Element(TableDataCell).Text(row.UACSCode);
                        table.Cell().Element(TableDataCell).Text(row.ObjectName);
                        table.Cell().Element(TableDataCell).Text(row.Description ?? string.Empty);
                        table.Cell().Element(TableDataCell).AlignRight().Text($"{row.Q1Budget:N2}");
                        table.Cell().Element(TableDataCell).AlignRight().Text($"{row.Q2Budget:N2}");
                        table.Cell().Element(TableDataCell).AlignRight().Text($"{row.Q3Budget:N2}");
                        table.Cell().Element(TableDataCell).AlignRight().Text($"{row.Q4Budget:N2}");
                        table.Cell().Element(TableDataCell).AlignRight().Text($"{row.TotalBudget:N2}");
                    }

                    // Sub-total row
                    table.Cell().ColumnSpan(7).Element(SubtotalCell)
                        .AlignRight().Text($"Sub-total, {expenseGroup.ExpenseClassType}").Bold();
                    table.Cell().Element(SubtotalCell)
                        .AlignRight().Text($"{expenseGroup.SubTotal:N2}").Bold();
                }

                // Activity sub-total
                table.Cell().ColumnSpan(7).Element(SubtotalCell)
                    .AlignRight().Text($"Sub-total, {apiGroup.ActivityName}").Bold();
                table.Cell().Element(SubtotalCell)
                    .AlignRight().Text($"{apiGroup.SubTotal:N2}").Bold();
            }

            // Grand Total
            table.Cell().ColumnSpan(7).Element(GrandTotalCell)
                .AlignRight().Text("GRAND TOTAL").Bold();
            table.Cell().Element(GrandTotalCell)
                .AlignRight().Text($"{request.TotalBudget:N2}").Bold();
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Section II — LINE ITEM BUDGET BY TARGET (monthly columns)
    // ─────────────────────────────────────────────────────────────────────────

    private static void RenderSectionII(ColumnDescriptor col, LibDataDto request)
    {
        col.Item().Text($"II. LINE ITEM BUDGET BY TARGET")
            .Bold().FontSize(9);

        col.Item().PaddingTop(4).Table(table =>
        {
            // UACS Code | Item | Jan-Dec | Total
            table.ColumnsDefinition(c =>
            {
                c.RelativeColumn(1.5f); // UACS Code
                c.RelativeColumn(3.0f); // Item of Expenditure
                c.RelativeColumn(1.0f); // Jan
                c.RelativeColumn(1.0f); // Feb
                c.RelativeColumn(1.0f); // Mar
                c.RelativeColumn(1.0f); // Apr
                c.RelativeColumn(1.0f); // May
                c.RelativeColumn(1.0f); // Jun
                c.RelativeColumn(1.0f); // Jul
                c.RelativeColumn(1.0f); // Aug
                c.RelativeColumn(1.0f); // Sep
                c.RelativeColumn(1.0f); // Oct
                c.RelativeColumn(1.0f); // Nov
                c.RelativeColumn(1.0f); // Dec
                c.RelativeColumn(1.5f); // Total
            });

            table.Header(h =>
            {
                SectionIHeader(h, "UACS Code");
                SectionIHeader(h, "Item of Expenditure");
                foreach (var month in new[] { "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                                              "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" })
                    SectionIHeader(h, month);
                SectionIHeader(h, "TOTAL");
            });

            foreach (var expenseGroup in request.MonthlyExpenseGroups)
            {
                // Expense class header row
                table.Cell().ColumnSpan(15).Element(ExpenseClassHeaderCell)
                    .Text(expenseGroup.ExpenseClassName).Bold().FontSize(7);

                foreach (var row in expenseGroup.Rows)
                {
                    table.Cell().Element(TableDataCell).Text(row.UACSCode);
                    table.Cell().Element(TableDataCell).Text(row.ObjectName);
                    table.Cell().Element(TableDataCell).AlignRight().Text($"{row.JanBudget:N2}");
                    table.Cell().Element(TableDataCell).AlignRight().Text($"{row.FebBudget:N2}");
                    table.Cell().Element(TableDataCell).AlignRight().Text($"{row.MarBudget:N2}");
                    table.Cell().Element(TableDataCell).AlignRight().Text($"{row.AprBudget:N2}");
                    table.Cell().Element(TableDataCell).AlignRight().Text($"{row.MayBudget:N2}");
                    table.Cell().Element(TableDataCell).AlignRight().Text($"{row.JunBudget:N2}");
                    table.Cell().Element(TableDataCell).AlignRight().Text($"{row.JulBudget:N2}");
                    table.Cell().Element(TableDataCell).AlignRight().Text($"{row.AugBudget:N2}");
                    table.Cell().Element(TableDataCell).AlignRight().Text($"{row.SepBudget:N2}");
                    table.Cell().Element(TableDataCell).AlignRight().Text($"{row.OctBudget:N2}");
                    table.Cell().Element(TableDataCell).AlignRight().Text($"{row.NovBudget:N2}");
                    table.Cell().Element(TableDataCell).AlignRight().Text($"{row.DecBudget:N2}");
                    table.Cell().Element(TableDataCell).AlignRight().Text($"{row.TotalBudget:N2}");
                }

                // Sub-total row
                table.Cell().ColumnSpan(14).Element(SubtotalCell)
                    .AlignRight().Text($"Sub-total, {expenseGroup.ExpenseClassType}").Bold();
                table.Cell().Element(SubtotalCell)
                    .AlignRight().Text($"{expenseGroup.SubTotal:N2}").Bold();
            }

            // Grand Total
            table.Cell().ColumnSpan(14).Element(GrandTotalCell)
                .AlignRight().Text("GRAND TOTAL").Bold();
            table.Cell().Element(GrandTotalCell)
                .AlignRight().Text($"{request.TotalBudget:N2}").Bold();
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Section III — SUMMARY BY ACCOUNT GROUP AND BY QUARTER
    // ─────────────────────────────────────────────────────────────────────────

    private static void RenderSectionIII(ColumnDescriptor col, LibDataDto request)
    {
        col.Item().PaddingTop(8).Text(
            "III. SUMMARY BY ACCOUNT GROUP AND BY QUARTER / IV. SUMMARY BY QUARTER")
            .Bold().FontSize(9);

        col.Item().PaddingTop(4).Table(table =>
        {
            table.ColumnsDefinition(c =>
            {
                c.RelativeColumn(5f); // Account Group
                c.RelativeColumn(2f); // Q1
                c.RelativeColumn(2f); // Q2
                c.RelativeColumn(2f); // Q3
                c.RelativeColumn(2f); // Q4
                c.RelativeColumn(2f); // Total
            });

            table.Header(h =>
            {
                SectionIHeader(h, "Account Group");
                SectionIHeader(h, "1st Quarter");
                SectionIHeader(h, "2nd Quarter");
                SectionIHeader(h, "3rd Quarter");
                SectionIHeader(h, "4th Quarter");
                SectionIHeader(h, "TOTAL");
            });

            foreach (var summary in request.AccountGroupSummaries)
            {
                table.Cell().Element(TableDataCell).Text(summary.ExpenseClassName);
                table.Cell().Element(TableDataCell).AlignRight().Text($"{summary.Q1Budget:N2}");
                table.Cell().Element(TableDataCell).AlignRight().Text($"{summary.Q2Budget:N2}");
                table.Cell().Element(TableDataCell).AlignRight().Text($"{summary.Q3Budget:N2}");
                table.Cell().Element(TableDataCell).AlignRight().Text($"{summary.Q4Budget:N2}");
                table.Cell().Element(TableDataCell).AlignRight().Text($"{summary.TotalBudget:N2}");
            }

            // Summary by quarter (Section IV) — grand total row
            var totalQ1 = request.AccountGroupSummaries.Sum(s => s.Q1Budget);
            var totalQ2 = request.AccountGroupSummaries.Sum(s => s.Q2Budget);
            var totalQ3 = request.AccountGroupSummaries.Sum(s => s.Q3Budget);
            var totalQ4 = request.AccountGroupSummaries.Sum(s => s.Q4Budget);

            table.Cell().Element(GrandTotalCell).Text("TOTAL").Bold();
            table.Cell().Element(GrandTotalCell).AlignRight().Text($"{totalQ1:N2}").Bold();
            table.Cell().Element(GrandTotalCell).AlignRight().Text($"{totalQ2:N2}").Bold();
            table.Cell().Element(GrandTotalCell).AlignRight().Text($"{totalQ3:N2}").Bold();
            table.Cell().Element(GrandTotalCell).AlignRight().Text($"{totalQ4:N2}").Bold();
            table.Cell().Element(GrandTotalCell).AlignRight().Text($"{request.TotalBudget:N2}").Bold();
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Section V — SUMMARY BY FUNDSOURCE
    // ─────────────────────────────────────────────────────────────────────────

    private static void RenderSectionV(ColumnDescriptor col, LibDataDto request)
    {
        if (request.FundSourceSummary is null) return;

        col.Item().PaddingTop(8).Text("V. SUMMARY BY FUNDSOURCE")
            .Bold().FontSize(9);

        col.Item().PaddingTop(4).Table(table =>
        {
            table.ColumnsDefinition(c =>
            {
                c.RelativeColumn(5f); // Fund Source
                c.RelativeColumn(2f); // Q1
                c.RelativeColumn(2f); // Q2
                c.RelativeColumn(2f); // Q3
                c.RelativeColumn(2f); // Q4
                c.RelativeColumn(2f); // Total
            });

            table.Header(h =>
            {
                SectionIHeader(h, "Fund Source");
                SectionIHeader(h, "1st Quarter");
                SectionIHeader(h, "2nd Quarter");
                SectionIHeader(h, "3rd Quarter");
                SectionIHeader(h, "4th Quarter");
                SectionIHeader(h, "TOTAL");
            });

            var fundSource = request.FundSourceSummary;
            table.Cell().Element(TableDataCell).Text(fundSource.FundSource);
            table.Cell().Element(TableDataCell).AlignRight().Text($"{fundSource.Q1Budget:N2}");
            table.Cell().Element(TableDataCell).AlignRight().Text($"{fundSource.Q2Budget:N2}");
            table.Cell().Element(TableDataCell).AlignRight().Text($"{fundSource.Q3Budget:N2}");
            table.Cell().Element(TableDataCell).AlignRight().Text($"{fundSource.Q4Budget:N2}");
            table.Cell().Element(GrandTotalCell).AlignRight().Text($"{fundSource.TotalBudget:N2}").Bold();
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Chart — Allotment by Objects of Expenditure (horizontal bar chart)
    // ─────────────────────────────────────────────────────────────────────────

    private static void RenderChart(ColumnDescriptor col, LibDataDto request)
    {
        if (request.AccountGroupSummaries.Count == 0) return;

        col.Item().PaddingTop(12).Column(chartCol =>
        {
            chartCol.Item()
                .AlignCenter()
                .Text("Allotment by Objects of Expenditure")
                .Bold().FontSize(9);

            var maxBudget = request.AccountGroupSummaries
                .Select(s => s.TotalBudget)
                .DefaultIfEmpty(1m)
                .Max();

            if (maxBudget <= 0m) maxBudget = 1m;

            const float labelWidth    = 140f;
            const float amountWidth   = 90f;
            const float barMaxWidth   = 250f;
            const float rowHeight     = 18f;
            const float barPadding    = 3f;

            foreach (var summary in request.AccountGroupSummaries)
            {
                var proportion = (float)(summary.TotalBudget / maxBudget);
                var barWidth   = proportion * barMaxWidth;

                chartCol.Item().PaddingTop(4).Row(barRow =>
                {
                    // Label
                    barRow.ConstantItem(labelWidth)
                        .Height(rowHeight)
                        .AlignMiddle()
                        .AlignRight()
                        .PaddingRight(4)
                        .Text(summary.ExpenseClassType)
                        .FontSize(7);

                    // Bar track
                    barRow.ConstantItem(barMaxWidth).Height(rowHeight).Column(track =>
                    {
                        track.Item().PaddingTop(barPadding).Row(inner =>
                        {
                            if (barWidth > 0)
                                inner.ConstantItem(barWidth)
                                    .Height(rowHeight - barPadding * 2)
                                    .Background(Colors.Blue.Medium);

                            inner.RelativeItem().Height(rowHeight - barPadding * 2);
                        });
                    });

                    // Amount
                    barRow.ConstantItem(amountWidth)
                        .Height(rowHeight)
                        .AlignMiddle()
                        .PaddingLeft(4)
                        .Text($"₱{summary.TotalBudget:N2}")
                        .FontSize(7);
                });
            }
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Cell style helpers
    // ─────────────────────────────────────────────────────────────────────────

    private static void SectionIHeader(TableCellDescriptor h, string text) =>
        h.Cell().Element(TableHeaderCell).AlignCenter().AlignMiddle().Text(text).Bold().FontSize(7);

    private static IContainer ActivityHeaderCell(IContainer c) =>
        c.Border(1).BorderColor(Colors.Grey.Medium)
         .Background(Colors.Blue.Lighten3)
         .Padding(3);

    private static IContainer ExpenseClassHeaderCell(IContainer c) =>
        c.Border(1).BorderColor(Colors.Grey.Medium)
         .Background(Colors.Teal.Lighten3)
         .Padding(3);

    private static IContainer SubtotalCell(IContainer c) =>
        c.Border(1).BorderColor(Colors.Grey.Medium)
         .Background(Colors.Grey.Lighten3)
         .Padding(3);

    private static IContainer GrandTotalCell(IContainer c) =>
        c.Border(1).BorderColor(Colors.Grey.Medium)
         .Background(Colors.Grey.Lighten2)
         .Padding(3);
}

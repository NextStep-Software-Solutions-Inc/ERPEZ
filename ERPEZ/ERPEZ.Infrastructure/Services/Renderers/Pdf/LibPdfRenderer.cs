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

    private static readonly PageSize legalLandscape =
        new(355.6f, 215.9f, Unit.Millimetre);

    public Task<byte[]> RenderAsync(
        LibDataDto request,
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
                                    .Text(string.IsNullOrWhiteSpace(request.LIBNumber) ? "-" : request.LIBNumber)
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
                                    metaRow.RelativeItem().Padding(2).AlignCenter()
                                        .Text(request.EffectiveDate.HasValue ? request.EffectiveDate.Value.ToString("MM/dd/yy") : "-")
                                        .FontSize(7);
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

                    h.Item().PaddingTop(4).Column(agency =>
                    {
                        agency.Item().Text("AGENCY:").Bold().FontSize(8);
                        agency.Item().Text(request.OfficeName).Bold().FontSize(8);
                    });
                });

                page.Content().PaddingTop(6).Column(col =>
                {
                    if (IsActivityScope(request))
                    {
                        RenderActivitySectionI(col, request);
                        col.Item().PageBreak();
                        RenderActivitySectionII(col, request);
                        col.Item().PageBreak();
                        RenderSectionIII(col, request);
                        RenderSectionIV(col, request);
                        RenderSectionV(col, request);
                        RenderChart(col, request);
                        RenderLibSignatories(col);
                    }
                    else
                    {
                        RenderLegacySectionI(col, request);
                        col.Item().PageBreak();
                        RenderLegacySectionII(col, request);
                        col.Item().PageBreak();
                        RenderSectionIII(col, request);
                        RenderSectionIV(col, request);
                        RenderSectionV(col, request);
                        RenderChart(col, request);
                        RenderLibSignatories(col);
                    }
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

    private static bool IsActivityScope(LibDataDto request) =>
        string.Equals(request.Scope, "ActivityLevel", StringComparison.OrdinalIgnoreCase);

    private static void RenderActivitySectionI(ColumnDescriptor col, LibDataDto request)
    {
        col.Item().Text($"I. LINE ITEM BUDGET BY API {request.FiscalYear}")
            .Bold().FontSize(9);

        col.Item().PaddingTop(2).Text($"FUNDSOURCE: {request.FundSource}")
            .Bold().FontSize(8);

        foreach (var apiGroup in request.ApiGroups)
        {
            col.Item().PaddingTop(4).Column(section =>
            {
                // RenderMetaRow(section, "NEP/GAA:", apiGroup.NepGaaLabel);
                RenderMetaRow(section, "PREXC/DYNAMIC/KRA:", apiGroup.PrexcDynamicKra);
                RenderMetaRow(section, "GOALS/OUTCOME:", apiGroup.GoalsOutcome);
                RenderMetaRow(section, "API:", apiGroup.ApiLabel);

                section.Item().PaddingTop(2).Table(table =>
                {
                    table.ColumnsDefinition(c =>
                    {
                        c.RelativeColumn(4.5f);
                        c.RelativeColumn(1.0f);
                        c.RelativeColumn(1.0f);
                        c.RelativeColumn(1.0f);
                        c.RelativeColumn(1.0f);
                        c.RelativeColumn(1.0f);
                        c.RelativeColumn(1.3f);
                    });

                    table.Header(h =>
                    {
                        SectionIHeader(h, "ITEM OF EXPENDITURE");
                        SectionIHeader(h, "UACS");
                        SectionIHeader(h, "1");
                        SectionIHeader(h, "2");
                        SectionIHeader(h, "3");
                        SectionIHeader(h, "4");
                        SectionIHeader(h, "TOTAL");
                    });

                    foreach (var expenseGroup in apiGroup.ExpenseGroups)
                    {
                        table.Cell().ColumnSpan(7).Element(ExpenseClassHeaderCell)
                            .Text(expenseGroup.ExpenseClassName).Bold().FontSize(7);

                        foreach (var row in expenseGroup.Rows)
                        {
                            table.Cell().Element(TableDataCell).Text(row.ObjectName);
                            table.Cell().Element(TableDataCell).Text(row.UACSCode);
                            table.Cell().Element(TableDataCell).AlignRight().Text(FormatAmount(row.Q1Budget));
                            table.Cell().Element(TableDataCell).AlignRight().Text(FormatAmount(row.Q2Budget));
                            table.Cell().Element(TableDataCell).AlignRight().Text(FormatAmount(row.Q3Budget));
                            table.Cell().Element(TableDataCell).AlignRight().Text(FormatAmount(row.Q4Budget));
                            table.Cell().Element(TableDataCell).AlignRight().Text(FormatAmount(row.TotalBudget));
                        }

                        table.Cell().ColumnSpan(6).Element(SubtotalCell)
                            .AlignRight().Text($"Sub-total, {expenseGroup.ExpenseClassType}").Bold();
                        table.Cell().Element(SubtotalCell)
                            .AlignRight().Text(FormatAmount(expenseGroup.SubTotal)).Bold();
                    }

                    table.Cell().ColumnSpan(6).Element(SubtotalCell)
                        .AlignRight().Text("Sub-total, API").Bold();
                    table.Cell().Element(SubtotalCell)
                        .AlignRight().Text(FormatAmount(apiGroup.SubTotal)).Bold();
                });
            });
        }

        col.Item().PaddingTop(2).Table(table =>
        {
            table.ColumnsDefinition(c =>
            {
                c.RelativeColumn(9.5f);
                c.RelativeColumn(1.3f);
            });

            table.Cell().Element(GrandTotalCell).AlignCenter().Text("GRAND TOTAL").Bold();
            table.Cell().Element(GrandTotalCell).AlignRight().Text(FormatAmount(request.TotalBudget)).Bold();
        });
    }

    private static void RenderLegacySectionI(ColumnDescriptor col, LibDataDto request)
    {
        col.Item().Text($"I. LINE ITEM BUDGET BY API {request.FiscalYear}")
            .Bold().FontSize(9);

        col.Item().PaddingTop(2).Text($"FUNDSOURCE: {request.FundSource}")
            .FontSize(8);

        // Each activity group gets its own label (outside the table) + its own table.
        foreach (var apiGroup in request.ApiGroups)
        {
            // Activity name rendered as a standalone label above the table
            col.Item().PaddingTop(6)
                .Background(Colors.Blue.Lighten3)
                .Border(1).BorderColor(Colors.Grey.Medium)
                .Padding(3)
                .Text(apiGroup.ActivityName).Bold().FontSize(7);

            col.Item().Table(table =>
            {
                table.ColumnsDefinition(c =>
                {
                    c.RelativeColumn(1.5f);
                    c.RelativeColumn(3.5f);
                    c.RelativeColumn(3.0f);
                    c.RelativeColumn(1.5f);
                    c.RelativeColumn(1.5f);
                    c.RelativeColumn(1.5f);
                    c.RelativeColumn(1.5f);
                    c.RelativeColumn(2.0f);
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

                foreach (var expenseGroup in apiGroup.ExpenseGroups)
                {
                    table.Cell().ColumnSpan(8).Element(ExpenseClassHeaderCell)
                        .Text(expenseGroup.ExpenseClassName).Bold().FontSize(7);

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

                    table.Cell().ColumnSpan(7).Element(SubtotalCell)
                        .AlignRight().Text($"Sub-total, {expenseGroup.ExpenseClassType}").Bold();
                    table.Cell().Element(SubtotalCell)
                        .AlignRight().Text($"{expenseGroup.SubTotal:N2}").Bold();
                }

                table.Cell().ColumnSpan(7).Element(SubtotalCell)
                    .AlignRight().Text($"Sub-total, {apiGroup.ActivityName}").Bold();
                table.Cell().Element(SubtotalCell)
                    .AlignRight().Text($"{apiGroup.SubTotal:N2}").Bold();
            });
        }

        col.Item().PaddingTop(2).Table(table =>
        {
            table.ColumnsDefinition(c =>
            {
                c.RelativeColumn(14.5f);
                c.RelativeColumn(2.0f);
            });

            table.Cell().Element(GrandTotalCell).AlignRight().Text("GRAND TOTAL").Bold();
            table.Cell().Element(GrandTotalCell).AlignRight().Text($"{request.TotalBudget:N2}").Bold();
        });
    }

    private static void RenderActivitySectionII(ColumnDescriptor col, LibDataDto request)
    {
        col.Item().Text("II. LINE ITEM BUDGET BY TARGET")
            .Bold().FontSize(9);

        col.Item().PaddingTop(2).Text($"FUNDSOURCE: {request.FundSource}")
            .Bold().FontSize(8);

        foreach (var targetGroup in request.TargetGroups)
        {
            col.Item().PaddingTop(4).Column(section =>
            {
                // RenderMetaRow(section, "NEP/GAA:", targetGroup.NepGaaLabel);
                RenderMetaRow(section, "PREXC/DYNAMIC/KRA:", targetGroup.PrexcDynamicKra);
                RenderMetaRow(section, "GOALS/OUTCOME:", targetGroup.GoalsOutcome);
                RenderMetaRow(section, "KPI:", targetGroup.KpiLabel);

                if (targetGroup.Targets.Count > 0)
                {
                    section.Item().PaddingTop(1).Text("TARGETS").Bold().FontSize(7);
                    foreach (var target in targetGroup.Targets)
                    {
                        section.Item().Text(target).FontSize(7);
                    }
                }

                section.Item().PaddingTop(2).Table(table =>
                {
                    table.ColumnsDefinition(c =>
                    {
                        c.RelativeColumn(3.4f);
                        c.RelativeColumn(0.9f);
                        for (var i = 0; i < 12; i++) c.RelativeColumn(0.9f);
                        c.RelativeColumn(1.3f);
                    });

                    table.Header(h =>
                    {
                        SectionIHeader(h, "OBJECTS OF EXPENDITURE");
                        SectionIHeader(h, "UACS");
                        SectionIHeader(h, "JANUARY");
                        SectionIHeader(h, "FEBRUARY");
                        SectionIHeader(h, "MARCH");
                        SectionIHeader(h, "APRIL");
                        SectionIHeader(h, "MAY");
                        SectionIHeader(h, "JUNE");
                        SectionIHeader(h, "JULY");
                        SectionIHeader(h, "AUGUST");
                        SectionIHeader(h, "SEPTEMBER");
                        SectionIHeader(h, "OCTOBER");
                        SectionIHeader(h, "NOVEMBER");
                        SectionIHeader(h, "DECEMBER");
                        SectionIHeader(h, "TOTAL");
                    });

                    foreach (var expenseGroup in targetGroup.ExpenseGroups)
                    {
                        table.Cell().ColumnSpan(15).Element(ExpenseClassHeaderCell)
                            .Text($"{expenseGroup.ExpenseClassName} - {expenseGroup.ExpenseClassType}")
                            .Bold().FontSize(7);

                        foreach (var row in expenseGroup.Rows)
                        {
                            table.Cell().Element(TableDataCell).Text(row.ObjectName);
                            table.Cell().Element(TableDataCell).Text(row.UACSCode);
                            table.Cell().Element(TableDataCell).AlignRight().Text(FormatAmount(row.JanBudget));
                            table.Cell().Element(TableDataCell).AlignRight().Text(FormatAmount(row.FebBudget));
                            table.Cell().Element(TableDataCell).AlignRight().Text(FormatAmount(row.MarBudget));
                            table.Cell().Element(TableDataCell).AlignRight().Text(FormatAmount(row.AprBudget));
                            table.Cell().Element(TableDataCell).AlignRight().Text(FormatAmount(row.MayBudget));
                            table.Cell().Element(TableDataCell).AlignRight().Text(FormatAmount(row.JunBudget));
                            table.Cell().Element(TableDataCell).AlignRight().Text(FormatAmount(row.JulBudget));
                            table.Cell().Element(TableDataCell).AlignRight().Text(FormatAmount(row.AugBudget));
                            table.Cell().Element(TableDataCell).AlignRight().Text(FormatAmount(row.SepBudget));
                            table.Cell().Element(TableDataCell).AlignRight().Text(FormatAmount(row.OctBudget));
                            table.Cell().Element(TableDataCell).AlignRight().Text(FormatAmount(row.NovBudget));
                            table.Cell().Element(TableDataCell).AlignRight().Text(FormatAmount(row.DecBudget));
                            table.Cell().Element(TableDataCell).AlignRight().Text(FormatAmount(row.TotalBudget));
                        }
                    }

                    table.Cell().ColumnSpan(14).Element(SubtotalCell).AlignCenter().Text("TOTAL").Bold();
                    table.Cell().Element(SubtotalCell).AlignRight().Text(FormatAmount(targetGroup.SubTotal)).Bold();
                });
            });
        }

        col.Item().PaddingTop(2).Table(table =>
        {
            table.ColumnsDefinition(c =>
            {
                c.RelativeColumn(14.2f);
                c.RelativeColumn(1.3f);
            });

            table.Cell().Element(GrandTotalCell).AlignCenter().Text("GRAND TOTAL").Bold();
            table.Cell().Element(GrandTotalCell).AlignRight().Text(FormatAmount(request.TotalBudget)).Bold();
        });
    }

    private static void RenderLegacySectionII(ColumnDescriptor col, LibDataDto request)
    {
        col.Item().Text("II. LINE ITEM BUDGET BY TARGET")
            .Bold().FontSize(9);

        col.Item().PaddingTop(4).Table(table =>
        {
            table.ColumnsDefinition(c =>
            {
                c.RelativeColumn(1.5f);
                c.RelativeColumn(3.0f);
                c.RelativeColumn(1.0f);
                c.RelativeColumn(1.0f);
                c.RelativeColumn(1.0f);
                c.RelativeColumn(1.0f);
                c.RelativeColumn(1.0f);
                c.RelativeColumn(1.0f);
                c.RelativeColumn(1.0f);
                c.RelativeColumn(1.0f);
                c.RelativeColumn(1.0f);
                c.RelativeColumn(1.0f);
                c.RelativeColumn(1.0f);
                c.RelativeColumn(1.0f);
                c.RelativeColumn(1.5f);
            });

            table.Header(h =>
            {
                SectionIHeader(h, "UACS Code");
                SectionIHeader(h, "Item of Expenditure");
                foreach (var month in new[] { "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" })
                    SectionIHeader(h, month);
                SectionIHeader(h, "TOTAL");
            });

            foreach (var expenseGroup in request.MonthlyExpenseGroups)
            {
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

                table.Cell().ColumnSpan(14).Element(SubtotalCell)
                    .AlignRight().Text($"Sub-total, {expenseGroup.ExpenseClassType}").Bold();
                table.Cell().Element(SubtotalCell)
                    .AlignRight().Text($"{expenseGroup.SubTotal:N2}").Bold();
            }

            table.Cell().ColumnSpan(14).Element(GrandTotalCell)
                .AlignRight().Text("GRAND TOTAL").Bold();
            table.Cell().Element(GrandTotalCell)
                .AlignRight().Text($"{request.TotalBudget:N2}").Bold();
        });
    }

    private static void RenderSectionIII(ColumnDescriptor col, LibDataDto request)
    {
        col.Item().PaddingTop(8).Text("III. SUMMARY BY ACCOUNT GROUP AND BY QUARTER")
            .Bold().FontSize(9);

        col.Item().PaddingTop(4).Table(table =>
        {
            table.ColumnsDefinition(c =>
            {
                c.RelativeColumn(5f);
                c.RelativeColumn(2f);
                c.RelativeColumn(2f);
                c.RelativeColumn(2f);
                c.RelativeColumn(2f);
                c.RelativeColumn(2f);
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
                table.Cell().ColumnSpan(6).Element(ExpenseClassHeaderCell)
                    .Text(summary.ExpenseClassType).Bold().FontSize(7);

                foreach (var row in summary.Rows)
                {
                    table.Cell().Element(TableDataCell).Text(row.AccountGroupName);
                    table.Cell().Element(TableDataCell).AlignRight().Text(FormatAmount(row.Q1Budget));
                    table.Cell().Element(TableDataCell).AlignRight().Text(FormatAmount(row.Q2Budget));
                    table.Cell().Element(TableDataCell).AlignRight().Text(FormatAmount(row.Q3Budget));
                    table.Cell().Element(TableDataCell).AlignRight().Text(FormatAmount(row.Q4Budget));
                    table.Cell().Element(TableDataCell).AlignRight().Text(FormatAmount(row.TotalBudget));
                }

                table.Cell().Element(SubtotalCell).AlignRight().Text($"Sub-total, {summary.ExpenseClassName}").Bold();
                table.Cell().Element(SubtotalCell).AlignRight().Text(FormatAmount(summary.Q1Budget)).Bold();
                table.Cell().Element(SubtotalCell).AlignRight().Text(FormatAmount(summary.Q2Budget)).Bold();
                table.Cell().Element(SubtotalCell).AlignRight().Text(FormatAmount(summary.Q3Budget)).Bold();
                table.Cell().Element(SubtotalCell).AlignRight().Text(FormatAmount(summary.Q4Budget)).Bold();
                table.Cell().Element(SubtotalCell).AlignRight().Text(FormatAmount(summary.TotalBudget)).Bold();
            }

            var totalQ1 = request.AccountGroupSummaries.Sum(s => s.Q1Budget);
            var totalQ2 = request.AccountGroupSummaries.Sum(s => s.Q2Budget);
            var totalQ3 = request.AccountGroupSummaries.Sum(s => s.Q3Budget);
            var totalQ4 = request.AccountGroupSummaries.Sum(s => s.Q4Budget);

            table.Cell().Element(GrandTotalCell).Text("TOTAL").Bold();
            table.Cell().Element(GrandTotalCell).AlignRight().Text(FormatAmount(totalQ1)).Bold();
            table.Cell().Element(GrandTotalCell).AlignRight().Text(FormatAmount(totalQ2)).Bold();
            table.Cell().Element(GrandTotalCell).AlignRight().Text(FormatAmount(totalQ3)).Bold();
            table.Cell().Element(GrandTotalCell).AlignRight().Text(FormatAmount(totalQ4)).Bold();
            table.Cell().Element(GrandTotalCell).AlignRight().Text(FormatAmount(request.TotalBudget)).Bold();
        });
    }

    // ── FIX 1: Two-row header with "QUARTER" spanning cols 1-4; allotment class
    //           rendered as a group-label row; added to BOTH scope branches.
    private static void RenderSectionIV(ColumnDescriptor col, LibDataDto request)
    {
        if (request.QuarterSummaries.Count == 0) return;

        col.Item().PaddingTop(6).Text("IV. SUMMARY BY QUARTER")
            .Bold().FontSize(9);

        col.Item().PaddingTop(2).Table(table =>
        {
            table.ColumnsDefinition(c =>
            {
                c.RelativeColumn(4f);
                c.RelativeColumn(2f);
                c.RelativeColumn(2f);
                c.RelativeColumn(2f);
                c.RelativeColumn(2f);
                c.RelativeColumn(2f);
            });

            // Two-row header: ALLOTMENT CLASS | QUARTER (span 4) | TOTAL
            //                                 |  1  |  2  |  3  |  4  |
            table.Header(h =>
            {
                h.Cell().RowSpan(2).Element(TableHeaderCell).AlignCenter().AlignMiddle()
                    .Text("ALLOTMENT CLASS").Bold().FontSize(7);
                h.Cell().ColumnSpan(4).Element(TableHeaderCell).AlignCenter()
                    .Text("QUARTER").Bold().FontSize(7);
                h.Cell().RowSpan(2).Element(TableHeaderCell).AlignCenter().AlignMiddle()
                    .Text("TOTAL").Bold().FontSize(7);
                h.Cell().Element(TableHeaderCell).AlignCenter().Text("1").Bold().FontSize(7);
                h.Cell().Element(TableHeaderCell).AlignCenter().Text("2").Bold().FontSize(7);
                h.Cell().Element(TableHeaderCell).AlignCenter().Text("3").Bold().FontSize(7);
                h.Cell().Element(TableHeaderCell).AlignCenter().Text("4").Bold().FontSize(7);
            });

            foreach (var summary in request.QuarterSummaries)
            {
                // Group label row (e.g. "Internally-Generated Fund 2023" / "MOOE")
                table.Cell().ColumnSpan(6).Element(ActivityHeaderCell)
                    .Text(summary.AllotmentClass).Bold().FontSize(7);

                // Detail rows — expense class entries under this allotment class
                var matchingSummaries = request.AccountGroupSummaries
                    .Where(a => string.Equals(a.ExpenseClassType, summary.AllotmentClass,
                        StringComparison.OrdinalIgnoreCase))
                    .ToList();

                foreach (var acctSummary in matchingSummaries)
                {
                    table.Cell().Element(TableDataCell).PaddingLeft(8)
                        .Text(acctSummary.ExpenseClassType).FontSize(7);
                    table.Cell().Element(TableDataCell).AlignRight()
                        .Text(FormatAmount(acctSummary.Q1Budget)).FontSize(7);
                    table.Cell().Element(TableDataCell).AlignRight()
                        .Text(FormatAmount(acctSummary.Q2Budget)).FontSize(7);
                    table.Cell().Element(TableDataCell).AlignRight()
                        .Text(FormatAmount(acctSummary.Q3Budget)).FontSize(7);
                    table.Cell().Element(TableDataCell).AlignRight()
                        .Text(FormatAmount(acctSummary.Q4Budget)).FontSize(7);
                    table.Cell().Element(TableDataCell).AlignRight()
                        .Text(FormatAmount(acctSummary.TotalBudget)).FontSize(7);
                }

                // Subtotal row for this allotment class
                table.Cell().Element(SubtotalCell).AlignRight().Text("TOTAL").Bold().FontSize(7);
                table.Cell().Element(SubtotalCell).AlignRight().Text(FormatAmount(summary.Q1Budget)).Bold().FontSize(7);
                table.Cell().Element(SubtotalCell).AlignRight().Text(FormatAmount(summary.Q2Budget)).Bold().FontSize(7);
                table.Cell().Element(SubtotalCell).AlignRight().Text(FormatAmount(summary.Q3Budget)).Bold().FontSize(7);
                table.Cell().Element(SubtotalCell).AlignRight().Text(FormatAmount(summary.Q4Budget)).Bold().FontSize(7);
                table.Cell().Element(SubtotalCell).AlignRight().Text(FormatAmount(summary.TotalBudget)).Bold().FontSize(7);
            }

            // Grand total row
            table.Cell().Element(GrandTotalCell).AlignRight().Text("TOTAL").Bold();
            table.Cell().Element(GrandTotalCell).AlignRight()
                .Text(FormatAmount(request.QuarterSummaries.Sum(s => s.Q1Budget))).Bold();
            table.Cell().Element(GrandTotalCell).AlignRight()
                .Text(FormatAmount(request.QuarterSummaries.Sum(s => s.Q2Budget))).Bold();
            table.Cell().Element(GrandTotalCell).AlignRight()
                .Text(FormatAmount(request.QuarterSummaries.Sum(s => s.Q3Budget))).Bold();
            table.Cell().Element(GrandTotalCell).AlignRight()
                .Text(FormatAmount(request.QuarterSummaries.Sum(s => s.Q4Budget))).Bold();
            table.Cell().Element(GrandTotalCell).AlignRight()
                .Text(FormatAmount(request.TotalBudget)).Bold();
        });
    }

    private static void RenderSectionV(ColumnDescriptor col, LibDataDto request)
    {
        if (request.FundSourceSummary is null) return;

        col.Item().PaddingTop(8).Text("V. SUMMARY BY FUNDSOURCE")
            .Bold().FontSize(9);

        col.Item().PaddingTop(4).Table(table =>
        {
            table.ColumnsDefinition(c =>
            {
                c.RelativeColumn(2.5f);
                c.RelativeColumn(4.5f);
                c.RelativeColumn(2.5f);
                c.RelativeColumn(2.5f);
            });

            table.Header(h =>
            {
                SectionIHeader(h, "ALLOTMENT CLASS");
                SectionIHeader(h, "ACCOUNT GROUP");
                SectionIHeader(h, request.FundSourceSummary.FundSource.ToUpperInvariant());
                SectionIHeader(h, "TOTAL");
            });

            var fundSource = request.FundSourceSummary;
            var groupedByClass = fundSource.AccountGroups
                .GroupBy(group => group.AllotmentClass)
                .OrderBy(group => group.Key);

            foreach (var allotmentGroup in groupedByClass)
            {
                var isFirstInClass = true;
                foreach (var accountGroup in allotmentGroup.OrderBy(item => item.AccountGroupName))
                {
                    table.Cell().Element(TableDataCell)
                        .Text(isFirstInClass ? allotmentGroup.Key : string.Empty);
                    table.Cell().Element(TableDataCell).Text(accountGroup.AccountGroupName);
                    table.Cell().Element(TableDataCell).AlignRight().Text(FormatAmount(accountGroup.Amount));
                    table.Cell().Element(TableDataCell).AlignRight().Text(FormatAmount(accountGroup.Amount));
                    isFirstInClass = false;
                }

                var classTotal = allotmentGroup.Sum(item => item.Amount);
                table.Cell().ColumnSpan(2).Element(SubtotalCell).AlignRight().Text("Sub-total").Bold();
                table.Cell().Element(SubtotalCell).AlignRight().Text(FormatAmount(classTotal)).Bold();
                table.Cell().Element(SubtotalCell).AlignRight().Text(FormatAmount(classTotal)).Bold();
            }

            table.Cell().ColumnSpan(2).Element(GrandTotalCell).AlignRight().Text("Total").Bold();
            table.Cell().Element(GrandTotalCell).AlignRight().Text(FormatAmount(fundSource.TotalBudget)).Bold();
            table.Cell().Element(GrandTotalCell).AlignRight().Text(FormatAmount(fundSource.TotalBudget)).Bold();
        });
    }

    private static void RenderChart(ColumnDescriptor col, LibDataDto request)
    {
        if (request.FundSourceSummary?.AccountGroups.Count is not > 0) return;

        col.Item().PaddingTop(12).Column(chartCol =>
        {
            chartCol.Item()
                .AlignCenter()
                .Text("Allotment by Objects of Expenditure")
                .Bold().FontSize(9);

            var chartRows = request.FundSourceSummary.AccountGroups
                .OrderByDescending(group => group.Amount)
                .Take(10)
                .ToList();

            var maxBudget = chartRows
                .Select(group => group.Amount)
                .DefaultIfEmpty(1m)
                .Max();

            if (maxBudget <= 0m) maxBudget = 1m;

            const float labelWidth  = 140f;
            const float amountWidth = 90f;
            const float barMaxWidth = 250f;
            const float rowHeight   = 18f;
            const float barPadding  = 3f;

            foreach (var row in chartRows)
            {
                var proportion = (float)(row.Amount / maxBudget);
                var barWidth = proportion * barMaxWidth;

                chartCol.Item().PaddingTop(4).Row(barRow =>
                {
                    barRow.ConstantItem(labelWidth)
                        .Height(rowHeight)
                        .AlignMiddle()
                        .AlignRight()
                        .PaddingRight(4)
                        .Text(row.AccountGroupName)
                        .FontSize(7);

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

                    barRow.ConstantItem(amountWidth)
                        .Height(rowHeight)
                        .AlignMiddle()
                        .PaddingLeft(4)
                        .Text(FormatAmount(row.Amount))
                        .FontSize(7);
                });
            }
        });
    }

    // ── FIX 2: Static 4-signatory footer matching the standard LIB form layout.
    //           Replaces the dynamic RenderSignatories(col, request.Signatories)
    //           call which rendered nothing because Signatories is always [].
    private static void RenderLibSignatories(ColumnDescriptor col)
    {
        col.Item().PaddingTop(24).Row(row =>
        {
            // 1. Submitted by
            row.RelativeItem().Column(sc =>
            {
                sc.Item().Text("Submitted by:").Bold().FontSize(8);
                sc.Item().PaddingTop(32).BorderBottom(1).BorderColor(Colors.Black).Text(string.Empty);
                sc.Item().Text("Signature over Printed Name").FontSize(7).Italic();
                sc.Item().PaddingTop(2).Text(string.Empty).FontSize(8);
                sc.Item().Text("Budget Officer / Head of Office").FontSize(7);
            });

            row.ConstantItem(10);

            // 2. Recommending Approval
            row.RelativeItem().Column(sc =>
            {
                sc.Item().Text("Recommending Approval:").Bold().FontSize(8);
                sc.Item().PaddingTop(32).BorderBottom(1).BorderColor(Colors.Black).Text(string.Empty);
                sc.Item().Text("Signature over Printed Name").FontSize(7).Italic();
                sc.Item().PaddingTop(2).Text(string.Empty).FontSize(8);
                sc.Item().Text("Vice Chancellor / Director").FontSize(7);
            });

            row.ConstantItem(10);

            // 3. Funds Available
            row.RelativeItem().Column(sc =>
            {
                sc.Item().Text("Funds Available:").Bold().FontSize(8);
                sc.Item().PaddingTop(32).BorderBottom(1).BorderColor(Colors.Black).Text(string.Empty);
                sc.Item().Text("Signature over Printed Name").FontSize(7).Italic();
                sc.Item().PaddingTop(2).Text(string.Empty).FontSize(8);
                sc.Item().Text("Director, Financial Management Services").FontSize(7);
            });

            row.ConstantItem(10);

            // 4. Approved by
            row.RelativeItem().Column(sc =>
            {
                sc.Item().Text("Approved by:").Bold().FontSize(8);
                sc.Item().PaddingTop(32).BorderBottom(1).BorderColor(Colors.Black).Text(string.Empty);
                sc.Item().Text("Signature over Printed Name").FontSize(7).Italic();
                sc.Item().PaddingTop(2).Text(string.Empty).FontSize(8);
                sc.Item().Text("President, USTP System").FontSize(7);
            });
        });
    }

    private static string FormatAmount(decimal amount) => $"{amount:N2}";

    private static void RenderMetaRow(ColumnDescriptor section, string label, string value)
    {
        section.Item().Row(row =>
        {
            row.ConstantItem(85).Text(label).Bold().FontSize(7);
            row.RelativeItem().Text(string.IsNullOrWhiteSpace(value) ? "-" : value).FontSize(7);
        });
    }

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
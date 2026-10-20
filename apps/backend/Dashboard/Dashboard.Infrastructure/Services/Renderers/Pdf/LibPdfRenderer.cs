using ERPEZ.Application.Common.Dtos;
using ERPEZ.Application.Features.Planning.Budgeting.Common.Enums;
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

    private static readonly PageSize legalLandscape = new(355.6f, 215.9f, Unit.Millimetre);

    private const float  psFontSize = 7;
    private const string psFont     = "Arial";

    // =========================================================================
    // Entry point
    // =========================================================================

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
                page.DefaultTextStyle(t => t.FontSize(psFontSize).FontFamily(psFont));

                page.Header().Column(h =>
                {
                    RenderAgencyHeader(
                        h,
                        request.ProcuringEntityName,
                        request.ProcuringEntityAddress,
                        request.LogoBytes,
                        appendixText: null,
                        documentTitle: "LINE ITEM BUDGET FORM",
                        documentSubtitle: $"FOR FISCAL YEAR {request.FiscalYear}",
                        showUnderline: false,
                        titleFontSize: 10f,
                        alignment: request.LetterheadAlignment);

                    if (!string.IsNullOrWhiteSpace(request.OfficeName))
                    {
                        h.Item().PaddingTop(3).Column(agency =>
                        {
                            agency.Item().Text($"OFFICE / UNIT: {request.OfficeName}").Bold().FontSize(8);
                        });
                    }
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
                    else if (IsProjectScope(request))
                    {
                        RenderProjectSectionI(col, request.ProjectScope!);
                        col.Item().PageBreak();
                        RenderProjectSignatories(col);
                    }
                    // No legacy branch — only Activity and Project are supported.
                });

                page.Footer().AlignRight().Text(t =>
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

    // =========================================================================
    // Scope detection
    // =========================================================================

    private static bool IsActivityScope(LibDataDto r) =>
        string.Equals(r.Scope, nameof(LIBScopeEnum.Activity), StringComparison.OrdinalIgnoreCase);

    private static bool IsProjectScope(LibDataDto r) =>
        string.Equals(r.Scope, nameof(LIBScopeEnum.Project), StringComparison.OrdinalIgnoreCase)
        && r.ProjectScope is not null;

    // =========================================================================
    // Section I — Activity scope
    // =========================================================================

    private static void RenderActivitySectionI(ColumnDescriptor col, LibDataDto request)
    {
        col.Item().Text($"I. LINE ITEM BUDGET BY API {request.FiscalYear}").Bold().FontSize(9);
        col.Item().PaddingTop(2).Text($"FUNDSOURCE: {request.FundSource}").Bold().FontSize(8);

        foreach (var apiGroup in request.ApiGroups)
        {
            col.Item().PaddingTop(4).Column(section =>
            {
                RenderActivityMetaBlock(section, "API:", apiGroup.ApiLabel,
                    apiGroup.PrexcDynamicKra, apiGroup.GoalsOutcome);

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

                    // Three-level hierarchy: allotment → account → subgroup → rows
                    foreach (var allotmentGroup in apiGroup.ExpenseGroups)
                    {
                        table.Cell().ColumnSpan(7).Element(ExpenseClassHeaderCell)
                            .Text(allotmentGroup.AllotmentClass).Bold().FontSize(7);

                        foreach (var accountGroup in allotmentGroup.AccountGroups)
                        {
                            table.Cell().ColumnSpan(7).Element(ActivityHeaderCell)
                                .Text(accountGroup.AccountGroupName).Bold().FontSize(7);

                            foreach (var subGroup in accountGroup.SubGroups)
                            {
                                if (!string.IsNullOrWhiteSpace(subGroup.SubGroupName))
                                {
                                    table.Cell().ColumnSpan(7).Element(SubGroupHeaderCell)
                                        .Text(subGroup.SubGroupName).FontSize(7);
                                }

                                foreach (var row in subGroup.Rows)
                                {
                                    table.Cell().Element(TableDataCell).Text(row.ObjectName);
                                    table.Cell().Element(TableDataCell).Text(row.UACSCode);
                                    table.Cell().Element(TableDataCell).AlignRight().Text(FormatAmount(row.Q1Budget));
                                    table.Cell().Element(TableDataCell).AlignRight().Text(FormatAmount(row.Q2Budget));
                                    table.Cell().Element(TableDataCell).AlignRight().Text(FormatAmount(row.Q3Budget));
                                    table.Cell().Element(TableDataCell).AlignRight().Text(FormatAmount(row.Q4Budget));
                                    table.Cell().Element(TableDataCell).AlignRight().Text(FormatAmount(row.TotalBudget));
                                }
                            }

                            table.Cell().ColumnSpan(6).Element(SubtotalCell)
                                .AlignRight().Text($"Sub-total, {accountGroup.AccountGroupName}").Bold();
                            table.Cell().Element(SubtotalCell)
                                .AlignRight().Text(FormatAmount(accountGroup.SubTotal)).Bold();
                        }

                        table.Cell().ColumnSpan(6).Element(SubtotalCell)
                            .AlignRight().Text($"Sub-total, {allotmentGroup.AllotmentClass}").Bold();
                        table.Cell().Element(SubtotalCell)
                            .AlignRight().Text(FormatAmount(allotmentGroup.SubTotal)).Bold();
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
            table.ColumnsDefinition(c => { c.RelativeColumn(9.5f); c.RelativeColumn(1.3f); });
            table.Cell().Element(GrandTotalCell).AlignCenter().Text("GRAND TOTAL").Bold();
            table.Cell().Element(GrandTotalCell).AlignRight().Text(FormatAmount(request.TotalBudget)).Bold();
        });
    }

    // =========================================================================
    // Section II — Activity scope (monthly)
    // =========================================================================

    private static void RenderActivitySectionII(ColumnDescriptor col, LibDataDto request)
    {
        col.Item().Text("II. LINE ITEM BUDGET BY TARGET").Bold().FontSize(9);
        col.Item().PaddingTop(2).Text($"FUNDSOURCE: {request.FundSource}").Bold().FontSize(8);

        foreach (var targetGroup in request.TargetGroups)
        {
            col.Item().PaddingTop(4).Column(section =>
            {
                RenderActivityMetaBlock(section, "KPI:", targetGroup.KpiLabel,
                    targetGroup.PrexcDynamicKra, targetGroup.GoalsOutcome,
                    targetGroup.Targets.Count > 0 ? targetGroup.Targets : null);

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
                        foreach (var m in new[] { "JANUARY","FEBRUARY","MARCH","APRIL","MAY","JUNE",
                                                  "JULY","AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER" })
                            SectionIHeader(h, m);
                        SectionIHeader(h, "TOTAL");
                    });

                    // Three-level hierarchy: allotment → account → subgroup → rows
                    foreach (var allotmentGroup in targetGroup.ExpenseGroups)
                    {
                        table.Cell().ColumnSpan(15).Element(ExpenseClassHeaderCell)
                            .Text(allotmentGroup.AllotmentClass).Bold().FontSize(7);

                        foreach (var accountGroup in allotmentGroup.AccountGroups)
                        {
                            table.Cell().ColumnSpan(15).Element(ActivityHeaderCell)
                                .Text(accountGroup.AccountGroupName).Bold().FontSize(7);

                            foreach (var subGroup in accountGroup.SubGroups)
                            {
                                if (!string.IsNullOrWhiteSpace(subGroup.SubGroupName))
                                {
                                    table.Cell().ColumnSpan(15).Element(SubGroupHeaderCell)
                                        .Text(subGroup.SubGroupName).FontSize(7);
                                }

                                foreach (var row in subGroup.Rows)
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

                            table.Cell().ColumnSpan(14).Element(SubtotalCell)
                                .AlignRight().Text($"Sub-total, {accountGroup.AccountGroupName}").Bold();
                            table.Cell().Element(SubtotalCell)
                                .AlignRight().Text(FormatAmount(accountGroup.SubTotal)).Bold();
                        }

                        table.Cell().ColumnSpan(14).Element(SubtotalCell)
                            .AlignRight().Text($"Sub-total, {allotmentGroup.AllotmentClass}").Bold();
                        table.Cell().Element(SubtotalCell)
                            .AlignRight().Text(FormatAmount(allotmentGroup.SubTotal)).Bold();
                    }

                    table.Cell().ColumnSpan(14).Element(SubtotalCell).AlignCenter().Text("TOTAL").Bold();
                    table.Cell().Element(SubtotalCell).AlignRight().Text(FormatAmount(targetGroup.SubTotal)).Bold();
                });
            });
        }

        col.Item().PaddingTop(2).Table(table =>
        {
            table.ColumnsDefinition(c => { c.RelativeColumn(14.2f); c.RelativeColumn(1.3f); });
            table.Cell().Element(GrandTotalCell).AlignCenter().Text("GRAND TOTAL").Bold();
            table.Cell().Element(GrandTotalCell).AlignRight().Text(FormatAmount(request.TotalBudget)).Bold();
        });
    }

    // =========================================================================
    // Section I — Project scope
    // =========================================================================

    private static void RenderProjectSectionI(ColumnDescriptor col, LibProjectScopeDto scope)
    {
        col.Item().PaddingBottom(8).Column(header => RenderProjectHeader(header, scope));

        col.Item().Table(table =>
        {
            DefineProjectTableColumns(table, scope.Columns.Count);
            RenderProjectTableHeader(table, scope.Columns);
            RenderProjectTableBody(table, scope);
        });
    }

    private static void RenderProjectHeader(ColumnDescriptor col, LibProjectScopeDto scope)
    {
        void LabelRow(string label, string value, bool bold = false)
        {
            col.Item().Row(row =>
            {
                row.ConstantItem(110).Text(label).FontFamily(psFont).FontSize(psFontSize).Bold();
                var txt = row.RelativeItem().Text(value).FontFamily(psFont).FontSize(psFontSize);
                if (bold) txt.Bold();
            });
        }

        LabelRow("PROJECT NAME:",     scope.ProjectTitle);
        LabelRow("Project Owner:",    scope.ProjectOwner);
        LabelRow("Project Amount:",   scope.ProjectAmount.ToString("N2"), bold: true);
        LabelRow("Project Duration:", scope.Duration);

        if (scope.ProjectStartDate.HasValue)
            LabelRow("Project Start:", scope.ProjectStartDate.Value.ToString("MMMM dd, yyyy"));
        if (scope.ProjectEndDate.HasValue)
            LabelRow("Project End:",   scope.ProjectEndDate.Value.ToString("MMMM dd, yyyy"));
    }

    private static void DefineProjectTableColumns(TableDescriptor table, int quarterCount)
    {
        table.ColumnsDefinition(cols =>
        {
            cols.RelativeColumn(4.5f);
            for (var i = 0; i < quarterCount; i++) cols.ConstantColumn(68f);
            cols.ConstantColumn(75f);
        });
    }

    private static void RenderProjectTableHeader(TableDescriptor table,
        List<LibProjectQuarterColumnDto> columns)
    {
        table.Header(header =>
        {
            // "Expenditure Items" — spans both header rows
            header.Cell().RowSpan(2)
                .Border(1).Background("#D9D9D9").AlignMiddle().AlignCenter()
                .Text("Expenditure Items").FontFamily(psFont).FontSize(psFontSize).Bold();

            // Year span groups (row 1): group by Year, render colspan
            var yearGroups = columns
                .GroupBy(c => c.Year)
                .OrderBy(g => g.Key)
                .ToList();

            foreach (var yg in yearGroups)
            {
                header.Cell().ColumnSpan((uint)yg.Count())
                    .Border(1).Background("#D9D9D9").AlignMiddle().AlignCenter()
                    .Text(yg.Key.ToString()).FontFamily(psFont).FontSize(psFontSize).Bold();
            }

            // TOTAL — spans both header rows
            header.Cell().RowSpan(2)
                .Border(1).Background("#D9D9D9").AlignMiddle().AlignCenter()
                .Text("TOTAL").FontFamily(psFont).FontSize(psFontSize).Bold();

            // Row 2: individual quarter labels (QuarterNumber → ordinal label)
            foreach (var c in columns)
            {
                var ordinal = c.QuarterNumber switch { 1 => "1st", 2 => "2nd", 3 => "3rd", _ => $"{c.QuarterNumber}th" };
                header.Cell()
                    .Border(1).Background("#D9D9D9").AlignMiddle().AlignCenter()
                    .Text($"{ordinal} Quarter").FontFamily(psFont).FontSize(psFontSize).Bold();
            }
        });
    }

    private static void RenderProjectTableBody(TableDescriptor table, LibProjectScopeDto scope)
    {
        var colCount  = scope.Columns.Count;
        var totalCols = 1 + colCount + 1;

        foreach (var allotmentGroup in scope.AllotmentGroups)
        {
            // Allotment class header
            table.Cell().ColumnSpan((uint)totalCols)
                .BorderLeft(1).BorderRight(1).BorderTop(1).Padding(2)
                .Text(allotmentGroup.AllotmentClass)
                .FontFamily(psFont).FontSize(psFontSize).Bold();

            foreach (var accountGroup in allotmentGroup.AccountGroups)
            {
                if (!string.IsNullOrWhiteSpace(accountGroup.AccountGroupName))
                {
                    table.Cell().ColumnSpan((uint)totalCols)
                        .BorderLeft(1).BorderRight(1).PaddingLeft(6).PaddingVertical(2)
                        .Text(accountGroup.AccountGroupName)
                        .FontFamily(psFont).FontSize(psFontSize);
                }

                foreach (var subGroup in accountGroup.SubGroups)
                {
                    if (!string.IsNullOrWhiteSpace(subGroup.SubGroupName))
                    {
                        table.Cell().ColumnSpan((uint)totalCols)
                            .BorderLeft(1).BorderRight(1).PaddingLeft(12).PaddingVertical(2)
                            .Text($"  {subGroup.SubGroupName}")
                            .FontFamily(psFont).FontSize(psFontSize).Italic();
                    }

                    foreach (var row in subGroup.Rows)
                        RenderProjectRow(table, row, colCount);

                    if (subGroup.SubGroupName is not null)
                        RenderProjectSubtotalRow(table, subGroup.SubTotal, colCount);
                }

                if (accountGroup.SubGroups.Any(s => s.SubGroupName is not null))
                    RenderProjectSubtotalRow(table, accountGroup.SubTotal, colCount);
            }

            RenderProjectAllotmentSubtotalRow(table, allotmentGroup, colCount);
        }

        RenderProjectGrandTotalRow(table, scope, colCount);
    }

    private static void RenderProjectRow(TableDescriptor table, LibRowDto row, int colCount)
    {
        table.Cell().Border(1).Padding(2).Column(c =>
        {
            c.Item().Text(t =>
            {
                t.Span(row.ObjectName).FontFamily(psFont).FontSize(psFontSize);
                if (!string.IsNullOrWhiteSpace(row.Description))
                {
                    t.Span("  ").FontSize(psFontSize);
                    t.Span(row.Description).FontFamily(psFont).FontSize(psFontSize).Italic();
                }
            });
        });

        for (var i = 0; i < colCount; i++)
        {
            var amount = i < row.QuarterAmounts.Count ? row.QuarterAmounts[i] : 0m;
            table.Cell().Border(1).Padding(2).AlignRight()
                .Text(amount > 0 ? amount.ToString("N2") : string.Empty)
                .FontFamily(psFont).FontSize(psFontSize);
        }

        table.Cell().Border(1).Padding(2).AlignRight()
            .Text(row.TotalBudget > 0 ? row.TotalBudget.ToString("N2") : string.Empty)
            .FontFamily(psFont).FontSize(psFontSize);
    }

    private static void RenderProjectSubtotalRow(TableDescriptor table, decimal total, int colCount)
    {
        table.Cell().ColumnSpan((uint)(1 + colCount))
            .Border(1).Background(Colors.Grey.Lighten3).Padding(2);

        table.Cell().Border(1).Background(Colors.Grey.Lighten3).Padding(2).AlignRight()
            .Text(total.ToString("N2")).FontFamily(psFont).FontSize(psFontSize).Bold();
    }

    private static void RenderProjectAllotmentSubtotalRow(
        TableDescriptor table, LibAllotmentGroupDto allotmentGroup, int colCount)
    {
        table.Cell().Border(1).Background("#F2F2F2").Padding(2).AlignRight().Text(string.Empty);

        for (var q = 0; q < colCount; q++)
        {
            var qTotal = allotmentGroup.AccountGroups
                .SelectMany(ag => ag.SubGroups)
                .SelectMany(sg => sg.Rows)
                .Sum(r => q < r.QuarterAmounts.Count ? r.QuarterAmounts[q] : 0m);

            table.Cell().Border(1).Background("#F2F2F2").Padding(2).AlignRight()
                .Text(qTotal > 0 ? qTotal.ToString("N2") : string.Empty)
                .FontFamily(psFont).FontSize(psFontSize).Bold();
        }

        table.Cell().Border(1).Background("#F2F2F2").Padding(2).AlignRight()
            .Text(allotmentGroup.SubTotal.ToString("N2"))
            .FontFamily(psFont).FontSize(psFontSize).Bold();
    }

    private static void RenderProjectGrandTotalRow(
        TableDescriptor table, LibProjectScopeDto scope, int colCount)
    {
        table.Cell().Border(1).Background("#D9D9D9").Padding(2).AlignRight()
            .Text("TOTAL:").FontFamily(psFont).FontSize(psFontSize).Bold();

        for (var q = 0; q < colCount; q++)
        {
            var qTotal = scope.AllotmentGroups
                .SelectMany(ag => ag.AccountGroups)
                .SelectMany(ac => ac.SubGroups)
                .SelectMany(sg => sg.Rows)
                .Sum(r => q < r.QuarterAmounts.Count ? r.QuarterAmounts[q] : 0m);

            table.Cell().Border(1).Background("#D9D9D9").Padding(2).AlignRight()
                .Text(qTotal > 0 ? qTotal.ToString("N2") : string.Empty)
                .FontFamily(psFont).FontSize(psFontSize).Bold();
        }

        var grandTotal = scope.AllotmentGroups.Sum(g => g.SubTotal);
        table.Cell().Border(1).Background("#D9D9D9").Padding(2).AlignRight()
            .Text(grandTotal.ToString("N2")).FontFamily(psFont).FontSize(psFontSize).Bold();
    }

    // =========================================================================
    // Section III
    // =========================================================================

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

            var t1 = request.AccountGroupSummaries.Sum(s => s.Q1Budget);
            var t2 = request.AccountGroupSummaries.Sum(s => s.Q2Budget);
            var t3 = request.AccountGroupSummaries.Sum(s => s.Q3Budget);
            var t4 = request.AccountGroupSummaries.Sum(s => s.Q4Budget);

            table.Cell().Element(GrandTotalCell).Text("TOTAL").Bold();
            table.Cell().Element(GrandTotalCell).AlignRight().Text(FormatAmount(t1)).Bold();
            table.Cell().Element(GrandTotalCell).AlignRight().Text(FormatAmount(t2)).Bold();
            table.Cell().Element(GrandTotalCell).AlignRight().Text(FormatAmount(t3)).Bold();
            table.Cell().Element(GrandTotalCell).AlignRight().Text(FormatAmount(t4)).Bold();
            table.Cell().Element(GrandTotalCell).AlignRight().Text(FormatAmount(request.TotalBudget)).Bold();
        });
    }

    // =========================================================================
    // Section IV
    // =========================================================================

    private static void RenderSectionIV(ColumnDescriptor col, LibDataDto request)
    {
        if (request.QuarterSummaries.Count == 0) return;

        col.Item().PaddingTop(6).Text("IV. SUMMARY BY QUARTER").Bold().FontSize(9);

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

            table.Header(h =>
            {
                SectionIHeader(h, "ALLOTMENT CLASS");
                SectionIHeader(h, "1");
                SectionIHeader(h, "2");
                SectionIHeader(h, "3");
                SectionIHeader(h, "4");
                SectionIHeader(h, "TOTAL");
            });

            foreach (var summary in request.QuarterSummaries)
            {
                table.Cell().Element(TableDataCell).Text(summary.AllotmentClass);
                table.Cell().Element(TableDataCell).AlignRight().Text(FormatAmount(summary.Q1Budget));
                table.Cell().Element(TableDataCell).AlignRight().Text(FormatAmount(summary.Q2Budget));
                table.Cell().Element(TableDataCell).AlignRight().Text(FormatAmount(summary.Q3Budget));
                table.Cell().Element(TableDataCell).AlignRight().Text(FormatAmount(summary.Q4Budget));
                table.Cell().Element(TableDataCell).AlignRight().Text(FormatAmount(summary.TotalBudget));
            }

            table.Cell().Element(GrandTotalCell).AlignRight().Text("TOTAL").Bold();
            table.Cell().Element(GrandTotalCell).AlignRight().Text(FormatAmount(request.QuarterSummaries.Sum(s => s.Q1Budget))).Bold();
            table.Cell().Element(GrandTotalCell).AlignRight().Text(FormatAmount(request.QuarterSummaries.Sum(s => s.Q2Budget))).Bold();
            table.Cell().Element(GrandTotalCell).AlignRight().Text(FormatAmount(request.QuarterSummaries.Sum(s => s.Q3Budget))).Bold();
            table.Cell().Element(GrandTotalCell).AlignRight().Text(FormatAmount(request.QuarterSummaries.Sum(s => s.Q4Budget))).Bold();
            table.Cell().Element(GrandTotalCell).AlignRight().Text(FormatAmount(request.TotalBudget)).Bold();
        });
    }

    // =========================================================================
    // Section V
    // =========================================================================

    private static void RenderSectionV(ColumnDescriptor col, LibDataDto request)
    {
        if (request.FundSourceSummary is null) return;

        col.Item().PaddingTop(8).Text("V. SUMMARY BY FUNDSOURCE").Bold().FontSize(9);

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

            var fundSource     = request.FundSourceSummary;
            var groupedByClass = fundSource.AccountGroups
                .GroupBy(g => g.AllotmentClass)
                .OrderBy(g => g.Key);

            foreach (var allotmentGroup in groupedByClass)
            {
                var isFirst = true;
                foreach (var accountGroup in allotmentGroup.OrderBy(i => i.AccountGroupName))
                {
                    table.Cell().Element(TableDataCell).Text(isFirst ? allotmentGroup.Key : string.Empty);
                    table.Cell().Element(TableDataCell).Text(accountGroup.AccountGroupName);
                    table.Cell().Element(TableDataCell).AlignRight().Text(FormatAmount(accountGroup.Amount));
                    table.Cell().Element(TableDataCell).AlignRight().Text(FormatAmount(accountGroup.Amount));
                    isFirst = false;
                }

                var classTotal = allotmentGroup.Sum(i => i.Amount);
                table.Cell().ColumnSpan(2).Element(SubtotalCell).AlignRight().Text("Sub-total").Bold();
                table.Cell().Element(SubtotalCell).AlignRight().Text(FormatAmount(classTotal)).Bold();
                table.Cell().Element(SubtotalCell).AlignRight().Text(FormatAmount(classTotal)).Bold();
            }

            table.Cell().ColumnSpan(2).Element(GrandTotalCell).AlignRight().Text("Total").Bold();
            table.Cell().Element(GrandTotalCell).AlignRight().Text(FormatAmount(fundSource.TotalBudget)).Bold();
            table.Cell().Element(GrandTotalCell).AlignRight().Text(FormatAmount(fundSource.TotalBudget)).Bold();
        });
    }

    // =========================================================================
    // Chart
    // =========================================================================

    private static void RenderChart(ColumnDescriptor col, LibDataDto request)
    {
        if (request.FundSourceSummary?.AccountGroups.Count is not > 0) return;

        col.Item().PaddingTop(12).Column(chartCol =>
        {
            chartCol.Item().AlignCenter()
                .Text("Allotment by Objects of Expenditure").Bold().FontSize(9);

            var chartRows = request.FundSourceSummary.AccountGroups
                .OrderByDescending(g => g.Amount).Take(10).ToList();

            var maxBudget = chartRows.Select(g => g.Amount).DefaultIfEmpty(1m).Max();
            if (maxBudget <= 0m) maxBudget = 1m;

            const float labelWidth  = 140f;
            const float amountWidth = 90f;
            const float barMaxWidth = 250f;
            const float rowHeight   = 18f;
            const float barPadding  = 3f;

            foreach (var row in chartRows)
            {
                var barWidth = (float)(row.Amount / maxBudget) * barMaxWidth;

                chartCol.Item().PaddingTop(4).Row(barRow =>
                {
                    barRow.ConstantItem(labelWidth)
                        .Height(rowHeight).AlignMiddle().AlignRight().PaddingRight(4)
                        .Text(row.AccountGroupName).FontSize(7);

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
                        .Height(rowHeight).AlignMiddle().PaddingLeft(4)
                        .Text(FormatAmount(row.Amount)).FontSize(7);
                });
            }
        });
    }

    // =========================================================================
    // Signatories
    // =========================================================================

    private static void RenderLibSignatories(ColumnDescriptor col)
    {
        col.Item().PaddingTop(24).Row(row =>
        {
            SignatoryBlock(row, "Submitted by:",           "Budget Officer / Head of Office");
            row.ConstantItem(10);
            SignatoryBlock(row, "Recommending Approval:",  "Vice Chancellor / Director");
            row.ConstantItem(10);
            SignatoryBlock(row, "Funds Available:",        "Director, Financial Management Services");
            row.ConstantItem(10);
            SignatoryBlock(row, "Approved by:",            "President, USTP System");
        });
    }

    private static void RenderProjectSignatories(ColumnDescriptor col)
    {
        col.Item().PaddingTop(24).Row(row =>
        {
            SignatoryBlock(row, "Prepared by:",  "Project Leader");
            row.ConstantItem(10);
            SignatoryBlock(row, "Funds Available:", "FMS Director");
            row.ConstantItem(10);
            SignatoryBlock(row, "Approved:",     "Chancellor");
        });
    }

    private static void SignatoryBlock(RowDescriptor row, string label, string position)
    {
        row.RelativeItem().Column(sc =>
        {
            sc.Item().Text(label).Bold().FontSize(8);
            sc.Item().PaddingTop(32).BorderBottom(1).BorderColor(Colors.Black).Text(string.Empty);
            sc.Item().Text("Signature over Printed Name").FontSize(7).Italic();
            sc.Item().PaddingTop(2).Text(position).FontSize(7);
        });
    }

    // =========================================================================
    // Shared helpers
    // =========================================================================

    private static string FormatAmount(decimal amount) => $"{amount:N2}";

    private static void RenderActivityMetaBlock(
        ColumnDescriptor section,
        string           primaryLabel,
        string           primaryValue,
        string           prexcDynamicKra,
        string           goalsOutcome,
        List<string>?    targets = null)
    {
        section.Item().PaddingTop(4)
            .Background("#FFF3CD")
            .Border(1).BorderColor("#E6AC00")
            .Padding(4)
            .Column(meta =>
            {
                if (!string.IsNullOrWhiteSpace(prexcDynamicKra))
                    meta.Item().Row(r =>
                    {
                        r.ConstantItem(120).Text("PREXC/DYNAMIC/KRA:").Bold().FontSize(7);
                        r.RelativeItem().Text(prexcDynamicKra).FontSize(7);
                    });

                if (!string.IsNullOrWhiteSpace(goalsOutcome))
                    meta.Item().Row(r =>
                    {
                        r.ConstantItem(120).Text("GOALS/OUTCOME:").Bold().FontSize(7);
                        r.RelativeItem().Text(goalsOutcome).FontSize(7);
                    });

                meta.Item().Row(r =>
                {
                    r.ConstantItem(120).Text(primaryLabel).Bold().FontSize(7);
                    r.RelativeItem()
                        .Text(string.IsNullOrWhiteSpace(primaryValue) ? "-" : primaryValue)
                        .FontSize(7);
                });

                if (targets is { Count: > 0 })
                {
                    meta.Item().PaddingTop(3).Text("TARGETS").Bold().FontSize(7);
                    foreach (var target in targets)
                        meta.Item().PaddingLeft(8).Text(target).FontSize(7);
                }
            });
    }

    private static void SectionIHeader(TableCellDescriptor h, string text) =>
        h.Cell().Element(TableHeaderCell).AlignCenter().AlignMiddle().Text(text).Bold().FontSize(7);

    private static IContainer ExpenseClassHeaderCell(IContainer c) =>
        c.Border(1).BorderColor(Colors.Grey.Medium).Background(Colors.Teal.Lighten3).Padding(3);

    private static IContainer ActivityHeaderCell(IContainer c) =>
        c.Border(1).BorderColor(Colors.Grey.Medium).Background(Colors.Blue.Lighten3).Padding(3);

    private static IContainer SubGroupHeaderCell(IContainer c) =>
        c.Border(1).BorderColor(Colors.Grey.Medium).Background(Colors.Blue.Lighten4).PaddingLeft(12).PaddingVertical(3);

    private static IContainer SubtotalCell(IContainer c) =>
        c.Border(1).BorderColor(Colors.Grey.Medium).Background(Colors.Grey.Lighten3).Padding(3);

    private static IContainer GrandTotalCell(IContainer c) =>
        c.Border(1).BorderColor(Colors.Grey.Medium).Background(Colors.Grey.Lighten2).Padding(3);

    // Shadows base class versions so the renderer controls its own cell styling consistently.
    private static new IContainer TableHeaderCell(IContainer c) =>
        c.Border(1).BorderColor(Colors.Grey.Medium).Background(Colors.Grey.Lighten3).Padding(3);

    private static new IContainer TableDataCell(IContainer c) =>
        c.Border(1).BorderColor(Colors.Grey.Medium).Padding(3);
}

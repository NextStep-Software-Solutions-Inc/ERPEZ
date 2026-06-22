using ClosedXML.Excel;
using ERPEZ.Application.Common.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Infrastructure.Services.DocumentGeneration;
using ERPEZ.Infrastructure.Services.Renderers.Excel.Base;

namespace ERPEZ.Infrastructure.Services.Renderers.Excel;

internal sealed class LibExcelRenderer : BaseExcelRenderer, IDocumentRenderer<LibDataDto>
{
    public DocumentType DocumentType => DocumentType.Lib;
    public ExportFormat Format       => ExportFormat.Excel;

    public Task<byte[]> RenderAsync(
        LibDataDto        request,
        CancellationToken cancellationToken = default)
    {
        using var workbook = new XLWorkbook();
        var sheet = workbook.Worksheets.Add("LIB");

        var currentRow = 1;
        RenderHeader(sheet, request, ref currentRow);

        if (IsActivityScope(request))
        {
            RenderActivitySectionI(sheet, request, ref currentRow);
            currentRow += 2;
            RenderActivitySectionII(sheet, request, ref currentRow);
        }
        else
        {
            RenderLegacySectionI(sheet, request, ref currentRow);
            currentRow += 2;
            RenderLegacySectionII(sheet, request, ref currentRow);
        }

        currentRow += 2;
        RenderSectionIII(sheet, request, ref currentRow);
        currentRow += 2;
        RenderSectionIV(sheet, request, ref currentRow);
        currentRow += 2;
        RenderSectionV(sheet, request, ref currentRow);

        sheet.Columns().AdjustToContents();
        using var ms = new MemoryStream();
        workbook.SaveAs(ms);
        return Task.FromResult(ms.ToArray());
    }

    private static bool IsActivityScope(LibDataDto request) =>
        string.Equals(request.Scope, "ActivityLevel", StringComparison.OrdinalIgnoreCase);

    // =========================================================================
    // Header
    // =========================================================================

    private static void RenderHeader(IXLWorksheet sheet, LibDataDto request, ref int row)
    {
        sheet.Cell(row, 1).Value          = "LINE ITEM BUDGET FORM";
        sheet.Cell(row, 1).Style.Font.Bold     = true;
        sheet.Cell(row, 1).Style.Font.FontSize = 12;

        row++;
        sheet.Cell(row, 1).Value          = $"FOR FISCAL YEAR {request.FiscalYear}";
        sheet.Cell(row, 1).Style.Font.Bold = true;

        row += 2;
        sheet.Cell(row, 1).Value          = "AGENCY:";
        sheet.Cell(row, 1).Style.Font.Bold = true;
        sheet.Cell(row, 2).Value          = request.OfficeName;
        sheet.Cell(row, 2).Style.Font.Bold = true;
        row += 2;
    }

    // =========================================================================
    // Section I — Activity scope  (quarterly)
    // =========================================================================

    private static void RenderActivitySectionI(IXLWorksheet sheet, LibDataDto request, ref int row)
    {
        sheet.Cell(row, 1).Value          = $"I. LINE ITEM BUDGET BY API {request.FiscalYear}";
        sheet.Cell(row, 1).Style.Font.Bold = true;
        row++;
        sheet.Cell(row, 1).Value          = $"FUNDSOURCE: {request.FundSource}";
        sheet.Cell(row, 1).Style.Font.Bold = true;
        row += 2;

        foreach (var apiGroup in request.ApiGroups)
        {
            WriteMeta(sheet, ref row, "PREXC/DYNAMIC/KRA:", apiGroup.PrexcDynamicKra);
            WriteMeta(sheet, ref row, "GOALS/OUTCOME:",     apiGroup.GoalsOutcome);
            WriteMeta(sheet, ref row, "API:",               apiGroup.ApiLabel);

            WriteRow(sheet, row++, true, "ITEM OF EXPENDITURE", "UACS", "1", "2", "3", "4", "TOTAL");

            foreach (var allotmentGroup in apiGroup.ExpenseGroups)
            {
                // Allotment class header (e.g. "MOOE", "PS")
                WriteIndentedHeader(sheet, row++, 0, allotmentGroup.AllotmentClass);

                foreach (var accountGroup in allotmentGroup.AccountGroups)
                {
                    // Account group header (e.g. "Communication Expenses")
                    WriteIndentedHeader(sheet, row++, 1, accountGroup.AccountGroupName);

                    foreach (var subGroup in accountGroup.SubGroups)
                    {
                        // Sub-account group header — only when a name exists
                        if (!string.IsNullOrWhiteSpace(subGroup.SubGroupName))
                            WriteIndentedHeader(sheet, row++, 2, subGroup.SubGroupName);

                        foreach (var item in subGroup.Rows)
                        {
                            WriteRow(
                                sheet, row++, false,
                                item.ObjectName,
                                item.UACSCode,
                                FormatAmount(item.Q1Budget),
                                FormatAmount(item.Q2Budget),
                                FormatAmount(item.Q3Budget),
                                FormatAmount(item.Q4Budget),
                                FormatAmount(item.TotalBudget));
                        }
                    }

                    // Account group subtotal
                    WriteRow(
                        sheet, row++,
                        $"Sub-total, {accountGroup.AccountGroupName}",
                        string.Empty, string.Empty, string.Empty, string.Empty, string.Empty,
                        FormatAmount(accountGroup.SubTotal));
                }

                // Allotment class subtotal
                WriteRow(
                    sheet, row++,
                    $"Sub-total, {allotmentGroup.AllotmentClass}",
                    string.Empty, string.Empty, string.Empty, string.Empty, string.Empty,
                    FormatAmount(allotmentGroup.SubTotal));
            }

            // API subtotal
            WriteRow(
                sheet, row++, true,
                "Sub-total, API",
                string.Empty, string.Empty, string.Empty, string.Empty, string.Empty,
                FormatAmount(apiGroup.SubTotal));

            row++;
        }

        WriteRow(
            sheet, row++,
            "GRAND TOTAL",
            string.Empty, string.Empty, string.Empty, string.Empty, string.Empty,
            FormatAmount(request.TotalBudget));
    }

    // =========================================================================
    // Section I — Legacy scope  (quarterly)
    // =========================================================================

    private static void RenderLegacySectionI(IXLWorksheet sheet, LibDataDto request, ref int row)
    {
        sheet.Cell(row, 1).Value          = $"I. LINE ITEM BUDGET BY API {request.FiscalYear}";
        sheet.Cell(row, 1).Style.Font.Bold = true;
        row++;
        sheet.Cell(row, 1).Value = $"FUNDSOURCE: {request.FundSource}";
        row += 2;

        WriteRow(sheet, row++, true, "UACS Code", "Item of Expenditure", "Description", "Q1", "Q2", "Q3", "Q4", "TOTAL");

        foreach (var apiGroup in request.ApiGroups)
        {
            // Activity name as group label
            WriteIndentedHeader(sheet, row++, 0, apiGroup.ActivityName);

            foreach (var allotmentGroup in apiGroup.ExpenseGroups)
            {
                // Allotment class header
                WriteIndentedHeader(sheet, row++, 1, allotmentGroup.AllotmentClass);

                foreach (var accountGroup in allotmentGroup.AccountGroups)
                {
                    // Account group header
                    WriteIndentedHeader(sheet, row++, 2, accountGroup.AccountGroupName);

                    foreach (var subGroup in accountGroup.SubGroups)
                    {
                        if (!string.IsNullOrWhiteSpace(subGroup.SubGroupName))
                            WriteIndentedHeader(sheet, row++, 3, subGroup.SubGroupName);

                        foreach (var item in subGroup.Rows)
                        {
                            WriteRow(
                                sheet, row++, false,
                                item.UACSCode,
                                item.ObjectName,
                                item.Description ?? string.Empty,
                                FormatAmount(item.Q1Budget),
                                FormatAmount(item.Q2Budget),
                                FormatAmount(item.Q3Budget),
                                FormatAmount(item.Q4Budget),
                                FormatAmount(item.TotalBudget));
                        }
                    }

                    // Account group subtotal
                    WriteRow(
                        sheet, row++,
                        $"Sub-total, {accountGroup.AccountGroupName}",
                        string.Empty, string.Empty, string.Empty, string.Empty, string.Empty, string.Empty,
                        FormatAmount(accountGroup.SubTotal));
                }

                // Allotment class subtotal
                WriteRow(
                    sheet, row++,
                    $"Sub-total, {allotmentGroup.AllotmentClass}",
                    string.Empty, string.Empty, string.Empty, string.Empty, string.Empty, string.Empty,
                    FormatAmount(allotmentGroup.SubTotal));
            }

            // Activity subtotal
            WriteRow(
                sheet, row++, true,
                $"Sub-total, {apiGroup.ActivityName}",
                string.Empty, string.Empty, string.Empty, string.Empty, string.Empty, string.Empty,
                FormatAmount(apiGroup.SubTotal));

            row++;
        }

        WriteRow(
            sheet, row++, true,
            "GRAND TOTAL",
            string.Empty, string.Empty, string.Empty, string.Empty, string.Empty, string.Empty,
            FormatAmount(request.TotalBudget));
    }

    // =========================================================================
    // Section II — Activity scope  (monthly)
    // =========================================================================

    private static void RenderActivitySectionII(IXLWorksheet sheet, LibDataDto request, ref int row)
    {
        sheet.Cell(row, 1).Value          = "II. LINE ITEM BUDGET BY TARGET";
        sheet.Cell(row, 1).Style.Font.Bold = true;
        row++;
        sheet.Cell(row, 1).Value = $"FUNDSOURCE: {request.FundSource}";
        row += 2;

        foreach (var targetGroup in request.TargetGroups)
        {
            WriteMeta(sheet, ref row, "PREXC/DYNAMIC/KRA:", targetGroup.PrexcDynamicKra);
            WriteMeta(sheet, ref row, "GOALS/OUTCOME:",     targetGroup.GoalsOutcome);
            WriteMeta(sheet, ref row, "KPI:",               targetGroup.KpiLabel);

            if (targetGroup.Targets.Count > 0)
            {
                sheet.Cell(row, 1).Value          = "TARGETS";
                sheet.Cell(row, 1).Style.Font.Bold = true;
                row++;

                foreach (var targetLine in targetGroup.Targets)
                {
                    sheet.Cell(row, 1).Value = targetLine;
                    row++;
                }
            }

            WriteRow(
                sheet, row++,
                "OBJECTS OF EXPENDITURE", "UACS",
                "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
                "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
                "TOTAL");

            foreach (var allotmentGroup in targetGroup.ExpenseGroups)
            {
                // Allotment class header
                WriteIndentedHeader(sheet, row++, 0, allotmentGroup.AllotmentClass);

                foreach (var accountGroup in allotmentGroup.AccountGroups)
                {
                    // Account group header
                    WriteIndentedHeader(sheet, row++, 1, accountGroup.AccountGroupName);

                    foreach (var subGroup in accountGroup.SubGroups)
                    {
                        if (!string.IsNullOrWhiteSpace(subGroup.SubGroupName))
                            WriteIndentedHeader(sheet, row++, 2, subGroup.SubGroupName);

                        foreach (var detail in subGroup.Rows)
                        {
                            WriteRow(
                                sheet, row++, false,
                                detail.ObjectName,
                                detail.UACSCode,
                                FormatAmount(detail.JanBudget),
                                FormatAmount(detail.FebBudget),
                                FormatAmount(detail.MarBudget),
                                FormatAmount(detail.AprBudget),
                                FormatAmount(detail.MayBudget),
                                FormatAmount(detail.JunBudget),
                                FormatAmount(detail.JulBudget),
                                FormatAmount(detail.AugBudget),
                                FormatAmount(detail.SepBudget),
                                FormatAmount(detail.OctBudget),
                                FormatAmount(detail.NovBudget),
                                FormatAmount(detail.DecBudget),
                                FormatAmount(detail.TotalBudget));
                        }
                    }

                    // Account group subtotal
                    WriteRow(
                        sheet, row++,
                        $"Sub-total, {accountGroup.AccountGroupName}",
                        string.Empty, string.Empty, string.Empty, string.Empty, string.Empty,
                        string.Empty, string.Empty, string.Empty, string.Empty, string.Empty,
                        string.Empty, string.Empty, string.Empty,
                        FormatAmount(accountGroup.SubTotal));
                }

                // Allotment class subtotal
                WriteRow(
                    sheet, row++,
                    $"Sub-total, {allotmentGroup.AllotmentClass}",
                    string.Empty, string.Empty, string.Empty, string.Empty, string.Empty,
                    string.Empty, string.Empty, string.Empty, string.Empty, string.Empty,
                    string.Empty, string.Empty, string.Empty,
                    FormatAmount(allotmentGroup.SubTotal));
            }

            // Target group total
            WriteRow(
                sheet, row++, true,
                "TOTAL",
                string.Empty, string.Empty, string.Empty, string.Empty, string.Empty,
                string.Empty, string.Empty, string.Empty, string.Empty, string.Empty,
                string.Empty, string.Empty, string.Empty,
                FormatAmount(targetGroup.SubTotal));

            row++;
        }

        WriteRow(
            sheet, row++, true,
            "GRAND TOTAL",
            string.Empty, string.Empty, string.Empty, string.Empty, string.Empty,
            string.Empty, string.Empty, string.Empty, string.Empty, string.Empty,
            string.Empty, string.Empty, string.Empty,
            FormatAmount(request.TotalBudget));
    }

    // =========================================================================
    // Section II — Legacy scope  (monthly, flat across all activities)
    // =========================================================================

    private static void RenderLegacySectionII(IXLWorksheet sheet, LibDataDto request, ref int row)
    {
        sheet.Cell(row, 1).Value          = "II. LINE ITEM BUDGET BY TARGET";
        sheet.Cell(row, 1).Style.Font.Bold = true;
        row += 2;

        WriteRow(
            sheet, row++, true,
            "UACS Code", "Item of Expenditure",
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
            "TOTAL");

        foreach (var allotmentGroup in request.MonthlyExpenseGroups)
        {
            // Allotment class header
            WriteIndentedHeader(sheet, row++, 0, allotmentGroup.AllotmentClass);

            foreach (var accountGroup in allotmentGroup.AccountGroups)
            {
                // Account group header
                WriteIndentedHeader(sheet, row++, 1, accountGroup.AccountGroupName);

                foreach (var subGroup in accountGroup.SubGroups)
                {
                    if (!string.IsNullOrWhiteSpace(subGroup.SubGroupName))
                        WriteIndentedHeader(sheet, row++, 2, subGroup.SubGroupName);

                    foreach (var detail in subGroup.Rows)
                    {
                        WriteRow(
                            sheet, row++,
                            detail.UACSCode,
                            detail.ObjectName,
                            FormatAmount(detail.JanBudget),
                            FormatAmount(detail.FebBudget),
                            FormatAmount(detail.MarBudget),
                            FormatAmount(detail.AprBudget),
                            FormatAmount(detail.MayBudget),
                            FormatAmount(detail.JunBudget),
                            FormatAmount(detail.JulBudget),
                            FormatAmount(detail.AugBudget),
                            FormatAmount(detail.SepBudget),
                            FormatAmount(detail.OctBudget),
                            FormatAmount(detail.NovBudget),
                            FormatAmount(detail.DecBudget),
                            FormatAmount(detail.TotalBudget));
                    }
                }

                // Account group subtotal
                WriteRow(
                    sheet, row++,
                    $"Sub-total, {accountGroup.AccountGroupName}",
                    string.Empty, string.Empty, string.Empty, string.Empty, string.Empty,
                    string.Empty, string.Empty, string.Empty, string.Empty, string.Empty,
                    string.Empty, string.Empty, string.Empty,
                    FormatAmount(accountGroup.SubTotal));
            }

            // Allotment class subtotal
            WriteRow(
                sheet, row++,
                $"Sub-total, {allotmentGroup.AllotmentClass}",
                string.Empty, string.Empty, string.Empty, string.Empty, string.Empty,
                string.Empty, string.Empty, string.Empty, string.Empty, string.Empty,
                string.Empty, string.Empty, string.Empty,
                FormatAmount(allotmentGroup.SubTotal));
        }

        WriteRow(
            sheet, row++, true,
            "GRAND TOTAL",
            string.Empty, string.Empty, string.Empty, string.Empty, string.Empty,
            string.Empty, string.Empty, string.Empty, string.Empty, string.Empty,
            string.Empty, string.Empty, string.Empty,
            FormatAmount(request.TotalBudget));
    }

    // =========================================================================
    // Section III — Summary by Account Group and by Quarter  (unchanged logic)
    // =========================================================================

    private static void RenderSectionIII(IXLWorksheet sheet, LibDataDto request, ref int row)
    {
        sheet.Cell(row, 1).Value          = "III. SUMMARY BY ACCOUNT GROUP AND BY QUARTER";
        sheet.Cell(row, 1).Style.Font.Bold = true;
        row++;
        WriteRow(sheet, row++, true, "ACCOUNT GROUP", "Q1", "Q2", "Q3", "Q4", "TOTAL");

        foreach (var summary in request.AccountGroupSummaries)
        {
            sheet.Cell(row, 1).Value          = summary.ExpenseClassType;
            sheet.Cell(row, 1).Style.Font.Bold = true;
            row++;

            foreach (var detail in summary.Rows)
            {
                WriteRow(
                    sheet, row++,
                    detail.AccountGroupName,
                    FormatAmount(detail.Q1Budget),
                    FormatAmount(detail.Q2Budget),
                    FormatAmount(detail.Q3Budget),
                    FormatAmount(detail.Q4Budget),
                    FormatAmount(detail.TotalBudget));
            }

            WriteRow(
                sheet, row++,
                $"Sub-total, {summary.ExpenseClassName}",
                FormatAmount(summary.Q1Budget),
                FormatAmount(summary.Q2Budget),
                FormatAmount(summary.Q3Budget),
                FormatAmount(summary.Q4Budget),
                FormatAmount(summary.TotalBudget));
        }

        WriteRow(
            sheet, row++, true,
            "TOTAL",
            FormatAmount(request.AccountGroupSummaries.Sum(s => s.Q1Budget)),
            FormatAmount(request.AccountGroupSummaries.Sum(s => s.Q2Budget)),
            FormatAmount(request.AccountGroupSummaries.Sum(s => s.Q3Budget)),
            FormatAmount(request.AccountGroupSummaries.Sum(s => s.Q4Budget)),
            FormatAmount(request.TotalBudget));
    }

    // =========================================================================
    // Section IV — Summary by Quarter  (unchanged logic)
    // =========================================================================

    private static void RenderSectionIV(IXLWorksheet sheet, LibDataDto request, ref int row)
    {
        sheet.Cell(row, 1).Value          = "IV. SUMMARY BY QUARTER";
        sheet.Cell(row, 1).Style.Font.Bold = true;
        row++;
        WriteRow(sheet, row++, true, "ALLOTMENT CLASS", "Q1", "Q2", "Q3", "Q4", "TOTAL");

        foreach (var summary in request.QuarterSummaries)
        {
            WriteRow(
                sheet, row++, false,
                summary.AllotmentClass,
                FormatAmount(summary.Q1Budget),
                FormatAmount(summary.Q2Budget),
                FormatAmount(summary.Q3Budget),
                FormatAmount(summary.Q4Budget),
                FormatAmount(summary.TotalBudget));
        }

        WriteRow(
            sheet, row++, true,
            "TOTAL",
            FormatAmount(request.QuarterSummaries.Sum(s => s.Q1Budget)),
            FormatAmount(request.QuarterSummaries.Sum(s => s.Q2Budget)),
            FormatAmount(request.QuarterSummaries.Sum(s => s.Q3Budget)),
            FormatAmount(request.QuarterSummaries.Sum(s => s.Q4Budget)),
            FormatAmount(request.TotalBudget));
    }

    // =========================================================================
    // Section V — Summary by Fund Source  (unchanged logic)
    // =========================================================================

    private static void RenderSectionV(IXLWorksheet sheet, LibDataDto request, ref int row)
    {
        if (request.FundSourceSummary is null) return;

        sheet.Cell(row, 1).Value          = "V. SUMMARY BY FUNDSOURCE";
        sheet.Cell(row, 1).Style.Font.Bold = true;
        row++;

        WriteRow(
            sheet, row++, true,
            "ALLOTMENT CLASS",
            "ACCOUNT GROUP",
            request.FundSourceSummary.FundSource,
            "TOTAL");

        foreach (var item in request.FundSourceSummary.AccountGroups)
        {
            WriteRow(
                sheet, row++, false,
                item.AllotmentClass,
                item.AccountGroupName,
                FormatAmount(item.Amount),
                FormatAmount(item.Amount));
        }

        WriteRow(
            sheet, row++, true,
            "TOTAL",
            string.Empty,
            FormatAmount(request.FundSourceSummary.TotalBudget),
            FormatAmount(request.FundSourceSummary.TotalBudget));
    }

    // =========================================================================
    // Helpers
    // =========================================================================

    private static void WriteMeta(IXLWorksheet sheet, ref int row, string label, string value)
    {
        sheet.Cell(row, 1).Value          = label;
        sheet.Cell(row, 1).Style.Font.Bold = true;
        sheet.Cell(row, 2).Value          = string.IsNullOrWhiteSpace(value) ? "-" : value;
        row++;
    }

    /// <summary>
    /// Writes a bold group-label row indented by <paramref name="level"/> spaces
    /// (0 = allotment class, 1 = account group, 2 = sub-account group, 3 = activity).
    /// </summary>
    private static void WriteIndentedHeader(IXLWorksheet sheet, int row, int level, string label)
    {
        var cell = sheet.Cell(row, 1);
        cell.Value          = new string(' ', level * 2) + label;
        cell.Style.Font.Bold = true;
        cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
    }

    private static string FormatAmount(decimal amount) => amount.ToString("N2");

    private static void WriteRow(IXLWorksheet sheet, int row, params string[] values) =>
        WriteRow(sheet, row, false, values);

    private static void WriteRow(IXLWorksheet sheet, int row, bool bold, params string[] values)
    {
        for (var i = 0; i < values.Length; i++)
        {
            var cell = sheet.Cell(row, i + 1);
            cell.Value          = values[i];
            cell.Style.Font.Bold = bold;
            cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
        }
    }
}
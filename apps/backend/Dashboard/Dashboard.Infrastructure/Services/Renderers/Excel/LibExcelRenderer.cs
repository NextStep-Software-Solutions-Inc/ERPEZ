using ClosedXML.Excel;
using ERPEZ.Application.Common.Dtos;
using ERPEZ.Application.Features.Planning.Budgeting.Common.Enums;
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

        // ── Branch by scope ───────────────────────────────────────────────────
        if (IsActivityScope(request))
        {
            RenderActivitySectionI(sheet, request, ref currentRow);
            currentRow += 2;
            RenderActivitySectionII(sheet, request, ref currentRow);
        }
        else if (IsProjectScope(request))
        {
            RenderProjectSectionI(sheet, request.ProjectScope!, ref currentRow);
        }
        else
        {
            RenderLegacySectionI(sheet, request, ref currentRow);
            currentRow += 2;
            RenderLegacySectionII(sheet, request, ref currentRow);
        }

        // ── Common sections (Activity + Legacy only) ────────────────────────────
        if (!IsProjectScope(request))
        {
            currentRow += 2;
            RenderSectionIII(sheet, request, ref currentRow);
            currentRow += 2;
            RenderSectionIV(sheet, request, ref currentRow);
            currentRow += 2;
            RenderSectionV(sheet, request, ref currentRow);
        }

        if (request.Signatories is { Count: > 0 })
        {
            var sigRow = currentRow + 3;
            for (var i = 0; i < request.Signatories.Count; i++)
            {
                RenderSignatoryBlock(sheet, sigRow, 1 + (i * 4), request.Signatories[i]);
            }
        }

        sheet.Columns().AdjustToContents();
        using var ms = new MemoryStream();
        workbook.SaveAs(ms);
        return Task.FromResult(ms.ToArray());
    }

    // ═════════════════════════════════════════════════════════════════════════
    // Scope Detection Methods
    // ═════════════════════════════════════════════════════════════════════════

    private static bool IsActivityScope(LibDataDto request) =>
        string.Equals(request.Scope, nameof(LIBScopeEnum.Activity), StringComparison.OrdinalIgnoreCase);

    private static bool IsProjectScope(LibDataDto request) =>
        string.Equals(request.Scope, nameof(LIBScopeEnum.Project), StringComparison.OrdinalIgnoreCase)
        && request.ProjectScope is not null;

    private static bool IsLegacyScope(LibDataDto request) =>
        !IsActivityScope(request) && !IsProjectScope(request);

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
    // Section I — Project Scope (NEW)
    // =========================================================================

    /// <summary>
    /// Renders the project-scope "LINE ITEM BUDGET" section (Section I variant).
    /// Produces: project header block + dynamic quarter table.
    /// </summary>
    private static void RenderProjectSectionI(IXLWorksheet sheet, LibProjectScopeDto scope, ref int row)
    {
        sheet.Cell(row, 1).Value          = "I. LINE ITEM BUDGET BY PROJECT";
        sheet.Cell(row, 1).Style.Font.Bold = true;
        row++;

        // ── Project header block ──────────────────────────────────────────────
        WriteMeta(sheet, ref row, "PROJECT NAME:",    scope.ProjectTitle);
        WriteMeta(sheet, ref row, "Project Owner:",   scope.ProjectOwner);
        WriteMeta(sheet, ref row, "Project Amount:",  scope.ProjectAmount.ToString("N2"));
        WriteMeta(sheet, ref row, "Project Duration:", scope.Duration);

        if (scope.ProjectStartDate.HasValue)
            WriteMeta(sheet, ref row, "Project Start:", scope.ProjectStartDate.Value.ToString("MMMM dd, yyyy"));

        if (scope.ProjectEndDate.HasValue)
            WriteMeta(sheet, ref row, "Project End:",   scope.ProjectEndDate.Value.ToString("MMMM dd, yyyy"));

        row++;

        // ── Table header (two rows: year span + quarter labels) ───────────────
        int headerRow = row;
        int dataRow = row + 1;

        // Row 1: Fixed labels (UACS, ObjectName, Description) + year spans
        sheet.Cell(headerRow, 1).Value = "UACS Code";
        sheet.Cell(headerRow, 1).Style.Font.Bold = true;
        sheet.Cell(headerRow, 2).Value = "Expenditure Item";
        sheet.Cell(headerRow, 2).Style.Font.Bold = true;
        sheet.Cell(headerRow, 3).Value = "Description";
        sheet.Cell(headerRow, 3).Style.Font.Bold = true;

        int colStart = 4;
        var yearGroups = scope.Columns
            .GroupBy(c => c.Year)
            .OrderBy(g => g.Key)
            .ToList();

        foreach (var yearGroup in yearGroups)
        {
            var yearCell = sheet.Cell(headerRow, colStart);
            yearCell.Value = yearGroup.Key.ToString();
            yearCell.Style.Font.Bold = true;
            yearCell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;

            // Merge cells for year span (if multiple quarters)
            if (yearGroup.Count() > 1)
            {
                sheet.Range(headerRow, colStart, headerRow, colStart + yearGroup.Count() - 1)
                    .Merge();
            }

            colStart += yearGroup.Count();
        }

        // TOTAL column header (Row 1)
        var totalHeaderCell = sheet.Cell(headerRow, colStart);
        totalHeaderCell.Value = "TOTAL";
        totalHeaderCell.Style.Font.Bold = true;
        totalHeaderCell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;

        // Row 2: Individual quarter labels
        colStart = 4;
        foreach (var col in scope.Columns)
        {
            var quarterCell = sheet.Cell(dataRow, colStart);
            quarterCell.Value = col.Label;
            quarterCell.Style.Font.Bold = true;
            quarterCell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
            colStart++;
        }

        // TOTAL column (Row 2)
        var totalDataCell = sheet.Cell(dataRow, colStart);
        totalDataCell.Value = "TOTAL";
        totalDataCell.Style.Font.Bold = true;
        totalDataCell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;

        row = dataRow + 1;

        // ── Table body ────────────────────────────────────────────────────────
        int colCount = scope.Columns.Count;

        foreach (var allotmentGroup in scope.AllotmentGroups)
        {
            // Allotment class header row
            WriteProjectSectionHeader(sheet, row++, allotmentGroup.AllotmentClass, colCount);

            foreach (var accountGroup in allotmentGroup.AccountGroups)
            {
                if (!string.IsNullOrWhiteSpace(accountGroup.AccountGroupName))
                    WriteProjectGroupLabel(sheet, row++, accountGroup.AccountGroupName, 1, colCount);

                foreach (var subGroup in accountGroup.SubGroups)
                {
                    if (!string.IsNullOrWhiteSpace(subGroup.SubGroupName))
                        WriteProjectGroupLabel(sheet, row++, $"  {subGroup.SubGroupName}", 2, colCount);

                    foreach (var item in subGroup.Rows)
                        WriteProjectRow(sheet, row++, item, colCount);

                    if (subGroup.SubGroupName is not null)
                        WriteProjectSubtotalRow(sheet, row++, subGroup.SubTotal, colCount);
                }

                if (accountGroup.SubGroups.Any(s => s.SubGroupName is not null))
                    WriteProjectSubtotalRow(sheet, row++, accountGroup.SubTotal, colCount);
            }

            // Allotment class subtotal
            WriteProjectSubtotalRow(sheet, row++, allotmentGroup.SubTotal, colCount, bold: true);
        }

        // Grand total row
        decimal grandTotal = scope.AllotmentGroups.Sum(g => g.SubTotal);
        WriteProjectGrandTotalRow(sheet, row++, grandTotal, colCount);

        row++;
    }

    private static void WriteProjectSectionHeader(IXLWorksheet sheet, int row, string label, int colCount)
    {
        var cell = sheet.Cell(row, 1);
        cell.Value = label;
        cell.Style.Font.Bold = true;
        cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;

        // Span across all columns (3 fixed + colCount quarter cols + 1 total)
        int totalCols = 3 + colCount + 1;
        sheet.Range(row, 1, row, totalCols).Merge();
    }

    private static void WriteProjectGroupLabel(IXLWorksheet sheet, int row, string label, int indentLevel, int colCount)
    {
        var cell = sheet.Cell(row, 1);
        cell.Value = new string(' ', indentLevel * 2) + label;
        cell.Style.Font.Italic = true;
        cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;

        int totalCols = 3 + colCount + 1;
        sheet.Range(row, 1, row, totalCols).Merge();
    }

    private static void WriteProjectRow(IXLWorksheet sheet, int row, LibRowDto item, int colCount)
    {
        // UACS code
        sheet.Cell(row, 1).Value = item.UACSCode;
        sheet.Cell(row, 1).Style.Border.OutsideBorder = XLBorderStyleValues.Thin;

        // Object name
        sheet.Cell(row, 2).Value = item.ObjectName;
        sheet.Cell(row, 2).Style.Border.OutsideBorder = XLBorderStyleValues.Thin;

        // Description
        sheet.Cell(row, 3).Value = item.Description ?? string.Empty;
        sheet.Cell(row, 3).Style.Border.OutsideBorder = XLBorderStyleValues.Thin;

        // Quarterly amounts — positionally aligned to Columns
        for (int i = 0; i < colCount; i++)
        {
            decimal amount = i < item.QuarterAmounts.Count ? item.QuarterAmounts[i] : 0m;
            var cell = sheet.Cell(row, 4 + i);
            cell.Value = amount > 0 ? amount.ToString("N2") : string.Empty;
            cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
            cell.Style.NumberFormat.Format = "#,##0.00";
        }

        // Total
        var totalCell = sheet.Cell(row, 4 + colCount);
        totalCell.Value = item.TotalBudget.ToString("N2");
        totalCell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
        totalCell.Style.NumberFormat.Format = "#,##0.00";
    }

    private static void WriteProjectSubtotalRow(IXLWorksheet sheet, int row, decimal total, int colCount, bool bold = false)
    {
        var cell = sheet.Cell(row, 1);
        cell.Value = "Sub-total";
        cell.Style.Font.Bold = bold;
        cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;

        // Span label across fixed + quarter columns
        sheet.Range(row, 1, row, 3 + colCount).Merge();

        // Total amount
        var totalCell = sheet.Cell(row, 4 + colCount);
        totalCell.Value = total.ToString("N2");
        totalCell.Style.Font.Bold = bold;
        totalCell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
        totalCell.Style.NumberFormat.Format = "#,##0.00";
    }

    private static void WriteProjectGrandTotalRow(IXLWorksheet sheet, int row, decimal total, int colCount)
    {
        var cell = sheet.Cell(row, 1);
        cell.Value = "GRAND TOTAL";
        cell.Style.Font.Bold = true;
        cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;

        sheet.Range(row, 1, row, 3 + colCount).Merge();

        var totalCell = sheet.Cell(row, 4 + colCount);
        totalCell.Value = total.ToString("N2");
        totalCell.Style.Font.Bold = true;
        totalCell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
        totalCell.Style.NumberFormat.Format = "#,##0.00";
    }

    // =========================================================================
    // Section I — Activity scope  (quarterly) — UNCHANGED
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
                WriteIndentedHeader(sheet, row++, 0, allotmentGroup.AllotmentClass);

                foreach (var accountGroup in allotmentGroup.AccountGroups)
                {
                    WriteIndentedHeader(sheet, row++, 1, accountGroup.AccountGroupName);

                    foreach (var subGroup in accountGroup.SubGroups)
                    {
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

                    WriteRow(
                        sheet, row++,
                        $"Sub-total, {accountGroup.AccountGroupName}",
                        string.Empty, string.Empty, string.Empty, string.Empty, string.Empty,
                        FormatAmount(accountGroup.SubTotal));
                }

                WriteRow(
                    sheet, row++,
                    $"Sub-total, {allotmentGroup.AllotmentClass}",
                    string.Empty, string.Empty, string.Empty, string.Empty, string.Empty,
                    FormatAmount(allotmentGroup.SubTotal));
            }

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
    // Section I — Legacy scope  (quarterly) — UNCHANGED
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
            WriteIndentedHeader(sheet, row++, 0, apiGroup.ActivityName);

            foreach (var allotmentGroup in apiGroup.ExpenseGroups)
            {
                WriteIndentedHeader(sheet, row++, 1, allotmentGroup.AllotmentClass);

                foreach (var accountGroup in allotmentGroup.AccountGroups)
                {
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

                    WriteRow(
                        sheet, row++,
                        $"Sub-total, {accountGroup.AccountGroupName}",
                        string.Empty, string.Empty, string.Empty, string.Empty, string.Empty, string.Empty,
                        FormatAmount(accountGroup.SubTotal));
                }

                WriteRow(
                    sheet, row++,
                    $"Sub-total, {allotmentGroup.AllotmentClass}",
                    string.Empty, string.Empty, string.Empty, string.Empty, string.Empty, string.Empty,
                    FormatAmount(allotmentGroup.SubTotal));
            }

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
    // Section II — Activity scope  (monthly) — UNCHANGED
    // =========================================================================

    private static void RenderActivitySectionII(IXLWorksheet sheet, LibDataDto request, ref int row)
    {
        sheet.Cell(row, 1).Value           = "II. LINE ITEM BUDGET BY TARGET";
        sheet.Cell(row, 1).Style.Font.Bold = true;
        row++;
        sheet.Cell(row, 1).Value = $"FUNDSOURCE: {request.FundSource}";
        row += 2;

        foreach (var targetGroup in request.TargetGroups)
        {
            if (!string.IsNullOrWhiteSpace(targetGroup.PrexcDynamicKra))
                WriteMeta(sheet, ref row, "PREXC/DYNAMIC/KRA:", targetGroup.PrexcDynamicKra);

            if (!string.IsNullOrWhiteSpace(targetGroup.GoalsOutcome))
                WriteMeta(sheet, ref row, "GOALS/OUTCOME:", targetGroup.GoalsOutcome);

            WriteMeta(sheet, ref row, "KPI:", targetGroup.KpiLabel);

            if (targetGroup.Targets.Count > 0)
            {
                sheet.Cell(row, 1).Value           = "TARGETS";
                sheet.Cell(row, 1).Style.Font.Bold = true;
                row++;

                foreach (var targetLine in targetGroup.Targets)
                {
                    sheet.Cell(row, 2).Value = targetLine;
                    row++;
                }
            }

            WriteRow(
                sheet, row++, true,
                "OBJECTS OF EXPENDITURE", "UACS",
                "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
                "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
                "TOTAL");

            foreach (var allotmentGroup in targetGroup.ExpenseGroups)
            {
                WriteIndentedHeader(sheet, row++, 0, allotmentGroup.AllotmentClass);

                foreach (var accountGroup in allotmentGroup.AccountGroups)
                {
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

                    WriteRow(
                        sheet, row++,
                        $"Sub-total, {accountGroup.AccountGroupName}",
                        string.Empty, string.Empty, string.Empty, string.Empty, string.Empty,
                        string.Empty, string.Empty, string.Empty, string.Empty, string.Empty,
                        string.Empty, string.Empty, string.Empty,
                        FormatAmount(accountGroup.SubTotal));
                }

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
    // Section II — Legacy scope  (monthly) — UNCHANGED
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
            WriteIndentedHeader(sheet, row++, 0, allotmentGroup.AllotmentClass);

            foreach (var accountGroup in allotmentGroup.AccountGroups)
            {
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

                WriteRow(
                    sheet, row++,
                    $"Sub-total, {accountGroup.AccountGroupName}",
                    string.Empty, string.Empty, string.Empty, string.Empty, string.Empty,
                    string.Empty, string.Empty, string.Empty, string.Empty, string.Empty,
                    string.Empty, string.Empty, string.Empty,
                    FormatAmount(accountGroup.SubTotal));
            }

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
    // Section III — Summary by Account Group and by Quarter (UNCHANGED)
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
    // Section IV — Summary by Quarter (UNCHANGED)
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
    // Section V — Summary by Fund Source (UNCHANGED)
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

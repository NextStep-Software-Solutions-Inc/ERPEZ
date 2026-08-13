// ERPEZ.Infrastructure/Services/DocumentGeneration/Renderers/Excel/WfpExcelRenderer.cs
using ClosedXML.Excel;
using ERPEZ.Application.Common.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Infrastructure.Services.Renderers.Excel.Base;

namespace ERPEZ.Infrastructure.Services.DocumentGeneration.Renderers.Excel;

internal sealed class WfpExcelRenderer
    : BaseExcelRenderer, IDocumentRenderer<WfpDataDto>
{
    public DocumentType DocumentType => DocumentType.Wfp;
    public ExportFormat Format       => ExportFormat.Excel;

    public async Task<byte[]> RenderAsync(
        WfpDataDto        request,
        CancellationToken cancellationToken = default)
    {
        using var wb = new XLWorkbook();
        wb.Worksheets.Add("WFP");
        var ws = wb.Worksheet(1);

        // ── Header block ─────────────────────────────────────────────────────
        // Row 1: "WORK PLAN" (centred, bold) — mirrors PDF h.Item().AlignCenter()
        ws.Cell(1, 1).Value           = "WORK PLAN";
        ws.Cell(1, 1).Style.Font.Bold = true;
        ws.Cell(1, 1).Style.Font.FontSize = 12;
        ws.Cell(1, 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        ws.Range(1, 1, 1, 9).Merge();

        // Row 4: Project Title (bold label | bold value) — mirrors PDF title row
        ws.Cell(4, 1).Value           = "Project Title:";
        ws.Cell(4, 1).Style.Font.Bold = true;
        ws.Cell(4, 2).Value           = request.ProjectTitle;
        ws.Cell(4, 2).Style.Font.Bold = true;

        // Row 5: Duration | Start Date | End Date (bold labels, plain values)
        // — mirrors PDF duration row with three RelativeItems
        ws.Cell(5, 1).Value           = "Project Duration (no. of months):";
        ws.Cell(5, 1).Style.Font.Bold = true;
        ws.Cell(5, 2).Value           = request.DurationMonths.ToString();

        ws.Cell(5, 4).Value           = "Project Start Date:";
        ws.Cell(5, 4).Style.Font.Bold = true;
        ws.Cell(5, 5).Value           = request.ProjectStartDate.ToString("MMMM dd, yyyy");

        ws.Cell(5, 7).Value           = "Project End Date:";
        ws.Cell(5, 7).Style.Font.Bold = true;
        ws.Cell(5, 8).Value           = request.ProjectEndDate.ToString("MMM dd, yyyy");

        // Row 6: Project Owner (bold label | plain value)
        // WFP.ProjectOwner takes priority; falls back to OfficeName
        // (Office → Cluster → Organization chain) — mirrors PDF ownerLine logic
        var ownerLine = !string.IsNullOrWhiteSpace(request.ProjectOwner)
            ? request.ProjectOwner
            : request.OfficeName;

        ws.Cell(6, 1).Value           = "Project Owner:";
        ws.Cell(6, 1).Style.Font.Bold = true;
        // ── Table Header (Rows 7 & 8) ─────────────────────────────────────────
        ws.Range(7, 1, 8, 1).Merge();
        StyleHeader(ws.Cell(7, 1), "OBJECTIVES");

        ws.Range(7, 2, 8, 2).Merge();
        StyleHeader(ws.Cell(7, 2), "TARGET ACTIVITIES");

        ws.Range(7, 3, 8, 3).Merge();
        StyleHeader(ws.Cell(7, 3), "TARGET ACCOMPLISHMENTS\n(with % weight and objectively verifiable indicators)");

        ws.Range(7, 4, 7, 9).Merge();
        StyleHeader(ws.Cell(7, 4), "ANNUAL TARGET- 100% (with % weight per quarter)");

        StyleHeader(ws.Cell(8, 4), "1st Quarter");
        StyleHeader(ws.Cell(8, 5), "2nd Quarter");
        StyleHeader(ws.Cell(8, 6), "3rd Quarter");
        StyleHeader(ws.Cell(8, 7), "4th Quarter");
        StyleHeader(ws.Cell(8, 8), "Total");
        StyleHeader(ws.Cell(8, 9), "Weighted %\nTotal");

        // ── Table body ────────────────────────────────────────────────────────
        var currentRow   = 9;
        var objectiveNum = 1;

        foreach (var objective in request.Objectives)
        {
            var objectiveStartRow = currentRow;

            // Prefix with ordinal number — mirrors PDF objectiveLabel logic
            var objectiveLabel = string.IsNullOrWhiteSpace(objective.ObjectiveText)
                ? string.Empty
                : $"{objectiveNum}. {objective.ObjectiveText}";

            if (objective.Activities.Count == 0)
            {
                // Defensive: mirrors PDF's zero-activity guard
                StyleData(ws.Cell(currentRow, 1), objectiveLabel);
                currentRow++;
                objectiveNum++;
                continue;
            }

            foreach (var activity in objective.Activities)
            {
                if (!string.IsNullOrEmpty(activity.GroupHeader))
                {
                    // Group header row — bold, spans activity columns
                    // mirrors PDF table.Cell().ColumnSpan(8)...Text(activity.GroupHeader).Bold()
                    ws.Cell(currentRow, 2).Value           = activity.GroupHeader;
                    ws.Cell(currentRow, 2).Style.Font.Bold = true;
                    ws.Range(currentRow, 2, currentRow, 9).Merge();
                    ws.Cell(currentRow, 2).Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
                    currentRow++;
                    continue;
                }

                StyleData(ws.Cell(currentRow, 2), activity.TargetActivity);
                StyleData(ws.Cell(currentRow, 3), activity.TargetAccomplishment);
                StyleData(ws.Cell(currentRow, 4), activity.Q1);
                StyleData(ws.Cell(currentRow, 5), activity.Q2);
                StyleData(ws.Cell(currentRow, 6), activity.Q3);
                StyleData(ws.Cell(currentRow, 7), activity.Q4);
                StyleData(ws.Cell(currentRow, 8), activity.Total);
                StyleData(ws.Cell(currentRow, 9), activity.WeightedPctTotal);
                currentRow++;
            }

            // Merge objective cell across all its activity rows — mirrors PDF RowSpan
            var mergeEnd = currentRow - 1;
            if (mergeEnd > objectiveStartRow)
                ws.Range(objectiveStartRow, 1, mergeEnd, 1).Merge();

            StyleData(ws.Cell(objectiveStartRow, 1), objectiveLabel);
            ws.Cell(objectiveStartRow, 1).Style.Alignment.Vertical = XLAlignmentVerticalValues.Top;
            ws.Cell(objectiveStartRow, 1).Style.Alignment.WrapText  = true;

            objectiveNum++; // mirrors PDF objectiveNum++
        }

        // ── Weighted % Total grand total row ──────────────────────────────────
        // Mirrors PDF grandWeightedTotal block and totalTable rendering.
        // Parses pre-formatted "X%" strings back to decimal — same logic as PDF.
        var grandWeightedTotal = request.Objectives
            .SelectMany(o => o.Activities)
            .Where(a => string.IsNullOrEmpty(a.GroupHeader))
            .Sum(a =>
            {
                if (decimal.TryParse(
                        a.WeightedPctTotal.Replace("%", "").Trim(),
                        System.Globalization.NumberStyles.Any,
                        System.Globalization.CultureInfo.InvariantCulture,
                        out var v)) return v;
                return 0m;
            });

        // Columns 1–8: blank shaded — mirrors PDF totalTable.Cell().ColumnSpan(8)
        ws.Range(currentRow, 1, currentRow, 8).Merge();
        ws.Cell(currentRow, 1).Style.Fill.BackgroundColor  = XLColor.FromHtml("#D9D9D9");
        ws.Cell(currentRow, 1).Style.Border.OutsideBorder  = XLBorderStyleValues.Thin;

        // Column 9: grand total — mirrors PDF totalTable last cell
        var totalCell = ws.Cell(currentRow, 9);
        totalCell.Value                              = $"{grandWeightedTotal:0.##}%";
        totalCell.Style.Font.Bold                    = true;
        totalCell.Style.Fill.BackgroundColor         = XLColor.FromHtml("#D9D9D9");
        totalCell.Style.Border.OutsideBorder         = XLBorderStyleValues.Thin;
        totalCell.Style.Alignment.Horizontal         = XLAlignmentHorizontalValues.Center;

        currentRow++;

        // ── Signatories ───────────────────────────────────────────────────────
        // Hard-coded to match PDF: Prepared by / Funds Available / Approved
        // — mirrors PDF WfpSignatoryBlock calls
        var sigRow = currentRow + 2;
        WriteSignatoryBlock(ws, sigRow, 1, "Prepared by:",     "Project Leader");
        WriteSignatoryBlock(ws, sigRow, 4, "Funds Available:", "FMS Director");
        WriteSignatoryBlock(ws, sigRow, 7, "Approved:",        "Chancellor");

        ws.Columns().AdjustToContents();
        using var ms = new MemoryStream();
        wb.SaveAs(ms);
        return ms.ToArray();
    }

    // =========================================================================
    // Helpers
    // =========================================================================

    /// <summary>
    /// Mirrors PDF's WfpSignatoryBlock: label → blank signature line → "Signature over Printed Name" → position.
    /// </summary>
    private static void WriteSignatoryBlock(
        IXLWorksheet ws, int row, int col, string label, string position)
    {
        ws.Cell(row, col).Value           = label;
        ws.Cell(row, col).Style.Font.Bold = true;

        var sigLineRow = row + 4;
        ws.Range(sigLineRow, col, sigLineRow, col + 2).Merge();
        ws.Cell(sigLineRow, col).Style.Border.BottomBorder      = XLBorderStyleValues.Thin;
        ws.Cell(sigLineRow, col).Style.Border.BottomBorderColor = XLColor.Black;

        ws.Cell(sigLineRow + 1, col).Value                   = "Signature over Printed Name";
        ws.Cell(sigLineRow + 1, col).Style.Font.Italic       = true;
        ws.Cell(sigLineRow + 1, col).Style.Font.FontSize     = 7;

        ws.Cell(sigLineRow + 2, col).Value                   = position;
        ws.Cell(sigLineRow + 2, col).Style.Font.FontSize     = 7;
    }

    /// <summary>
    /// Mirrors PDF's TableDataCell: border + wrap + top-align.
    /// </summary>
    private static void StyleData(IXLCell cell, string? value)
    {
        cell.Value                           = value ?? string.Empty;
        cell.Style.Border.OutsideBorder      = XLBorderStyleValues.Thin;
        cell.Style.Alignment.WrapText        = true;
        cell.Style.Alignment.Vertical        = XLAlignmentVerticalValues.Top;
        cell.Style.Alignment.Horizontal      = XLAlignmentHorizontalValues.Left;
    }
}

using ClosedXML.Excel;
using ERPEZ.Application.Common.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Infrastructure.Services.DocumentGeneration;
using ERPEZ.Infrastructure.Services.Renderers.Excel.Base;

namespace ERPEZ.Infrastructure.Services.Renderers.Excel;

internal sealed class AppExcelRenderer : BaseExcelRenderer, IDocumentRenderer<AppDataDto>
{
    public DocumentType DocumentType => DocumentType.App;
    public ExportFormat Format       => ExportFormat.Excel;

    public Task<byte[]> RenderAsync(
        AppDataDto        request,
        CancellationToken cancellationToken = default)
    {
        using var wb = LoadTemplate("app_template.xlsx");
        var ws = wb.Worksheet(1);

        // Header and metadata
        ws.Cell("C2").Value = $"ANNUAL PROCUREMENT PLAN FOR FY {request.FiscalYear}";
        ws.Cell("C2").Style.Font.Bold = true;
        ws.Cell("C2").Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

        var versionStr = request.IsUpdated && !string.IsNullOrWhiteSpace(request.VersionNumber)
            ? $" (Ver. {request.VersionNumber})"
            : string.Empty;

        ws.Cell("D4").Value = request.IsIndicative ? "☑ INDICATIVE" : "☐ INDICATIVE";
        ws.Cell("F4").Value = request.IsFinal ? "☑ FINAL" : "☐ FINAL";
        ws.Cell("H4").Value = request.IsUpdated ? $"☑ UPDATED{versionStr}" : "☐ UPDATED";

        var currentRow = 11;

        RenderSectionRows(ws, "General Requirements", request.GeneralRequirements, ref currentRow);
        RenderSectionRows(ws, "Common-Use Supplies", request.CommonUseSupplies, ref currentRow);
        RenderSectionRows(ws, "Miscellaneous Items", request.MiscellaneousItems, ref currentRow);

        // Totals Block
        currentRow += 1;
        ws.Range(currentRow, 1, currentRow, 9).Merge();
        ws.Cell(currentRow, 1).Value = "Total Amount of Estimated Budget for EPA Projects:";
        ws.Cell(currentRow, 1).Style.Font.FontSize = 8;
        ws.Cell(currentRow, 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;
        StyleData(ws.Cell(currentRow, 10), request.TotalEpaProjects);
        ws.Cell(currentRow, 10).Style.NumberFormat.Format = "#,##0.00";
        ws.Cell(currentRow, 10).Style.Font.Bold = true;

        currentRow++;
        ws.Range(currentRow, 1, currentRow, 9).Merge();
        ws.Cell(currentRow, 1).Value = "Total Amount of CSEs to be purchased from PS-DBM:";
        ws.Cell(currentRow, 1).Style.Font.FontSize = 8;
        ws.Cell(currentRow, 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;
        StyleData(ws.Cell(currentRow, 10), request.TotalCsePsDbm);
        ws.Cell(currentRow, 10).Style.NumberFormat.Format = "#,##0.00";
        ws.Cell(currentRow, 10).Style.Font.Bold = true;

        currentRow++;
        ws.Range(currentRow, 1, currentRow, 9).Merge();
        ws.Cell(currentRow, 1).Value = "Total Amount of Estimated Budget:";
        ws.Cell(currentRow, 1).Style.Font.FontSize = 8;
        ws.Cell(currentRow, 1).Style.Font.Bold = true;
        ws.Cell(currentRow, 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;
        StyleData(ws.Cell(currentRow, 10), request.TotalEstimatedBudget);
        ws.Cell(currentRow, 10).Style.NumberFormat.Format = "#,##0.00";
        ws.Cell(currentRow, 10).Style.Font.Bold = true;

        // Signatories
        var sigRow = currentRow + 3;
        for (var i = 0; i < request.Signatories.Count; i++)
        {
            RenderSignatoryBlock(ws, sigRow, 1 + (i * 4), request.Signatories[i]);
        }

        ws.Columns().AdjustToContents();
        using var ms = new MemoryStream();
        wb.SaveAs(ms);
        return Task.FromResult(ms.ToArray());
    }

    private static void RenderSectionRows(
        IXLWorksheet ws,
        string title,
        List<AppItemRowDto> rows,
        ref int currentRow)
    {
        if (rows == null || rows.Count == 0) return;

        // Section Title Row
        ws.Range(currentRow, 1, currentRow, 12).Merge();
        ws.Cell(currentRow, 1).Value = title;
        ws.Cell(currentRow, 1).Style.Font.Bold = true;
        ws.Cell(currentRow, 1).Style.Font.FontSize = 9;
        ws.Cell(currentRow, 1).Style.Fill.BackgroundColor = XLColor.FromHtml("#EAEAEA");
        ws.Cell(currentRow, 1).Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
        currentRow++;

        foreach (var row in rows)
        {
            StyleData(ws.Cell(currentRow, 1), row.ProjectTitle);
            StyleData(ws.Cell(currentRow, 2), row.EndUserOrImplementingUnit);
            StyleData(ws.Cell(currentRow, 3), row.GeneralDescription);
            StyleData(ws.Cell(currentRow, 4), row.ModeOfProcurement);
            StyleData(ws.Cell(currentRow, 5), row.CoveredByEpa ? "Yes" : "No");
            ws.Cell(currentRow, 5).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
            StyleData(ws.Cell(currentRow, 6), row.CriteriaForBidEvaluation);
            StyleData(ws.Cell(currentRow, 7), row.StartOfProcurement);
            ws.Cell(currentRow, 7).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
            StyleData(ws.Cell(currentRow, 8), row.EndOfProcurement);
            ws.Cell(currentRow, 8).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
            StyleData(ws.Cell(currentRow, 9), row.SourceOfFund);
            StyleData(ws.Cell(currentRow, 10), row.EstimatedBudget);
            ws.Cell(currentRow, 10).Style.NumberFormat.Format = "#,##0.00";
            StyleData(ws.Cell(currentRow, 11), row.ProcurementStrategyOrTools);
            StyleData(ws.Cell(currentRow, 12), row.Remarks);

            currentRow++;
        }
    }
}

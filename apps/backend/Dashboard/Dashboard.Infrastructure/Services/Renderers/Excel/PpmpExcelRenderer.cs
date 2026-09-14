using ClosedXML.Excel;
using ERPEZ.Application.Common.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Infrastructure.Services.DocumentGeneration;
using ERPEZ.Infrastructure.Services.Renderers.Excel.Base;

namespace ERPEZ.Infrastructure.Services.Renderers.Excel;

internal sealed class PpmpExcelRenderer
    : BaseExcelRenderer, IDocumentRenderer<PpmpDataDto>
{
    public DocumentType DocumentType => DocumentType.Ppmp;
    public ExportFormat Format       => ExportFormat.Excel;

    public Task<byte[]> RenderAsync(
        PpmpDataDto       request,
        CancellationToken cancellationToken = default)
    {
        using var wb = LoadTemplate("ppmp_template.xlsx");
        var ws = wb.Worksheet(1);

        var titlePrefix = request.IsSupplemental
            ? "SUPPLEMENTAL PROJECT PROCUREMENT MANAGEMENT PLAN (PPMP)"
            : "PROJECT PROCUREMENT MANAGEMENT PLAN (PPMP)";
        var cleanPpmpNumber = request.PpmpNumber;
        if (cleanPpmpNumber.StartsWith("SUPPLEMENTAL ", StringComparison.OrdinalIgnoreCase))
        {
            cleanPpmpNumber = cleanPpmpNumber["SUPPLEMENTAL ".Length..].Trim();
        }
        ws.Cell("C2").Value = $"{titlePrefix} NO. {cleanPpmpNumber}";
        ws.Cell("C2").Style.Font.Bold = true;
        ws.Cell("C2").Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

        var isIndicative = !request.IsFinal && !request.IsSupplemental;
        var isFinal = request.IsFinal || request.IsSupplemental;
        ws.Cell("D4").Value = isIndicative ? "☑ INDICATIVE" : "☐ INDICATIVE";
        ws.Cell("F4").Value = isFinal ? "☑ FINAL" : "☐ FINAL";
        ws.Cell("A6").Value = $"Fiscal Year: {request.FiscalYear}";
        ws.Cell("A7").Value = $"End-User or Implementing Unit: {request.EndUserUnit}";

        const int dataStartRow = 11;
        for (var i = 0; i < request.Rows.Count; i++)
        {
            var row = request.Rows[i];
            var r   = dataStartRow + i;

            StyleData(ws.Cell(r, 1),  row.GeneralDescription);
            StyleData(ws.Cell(r, 2),  row.ProjectType);
            StyleData(ws.Cell(r, 3),  row.QuantityAndSize);
            StyleData(ws.Cell(r, 4),  row.ProcurementMode);
            StyleData(ws.Cell(r, 5),  row.PreProcurementConference);
            StyleData(ws.Cell(r, 6),  row.StartOfProcurement);
            StyleData(ws.Cell(r, 7),  row.EndOfProcurement);
            StyleData(ws.Cell(r, 8),  row.ExpectedDeliveryPeriod);
            StyleData(ws.Cell(r, 9),  row.SourceOfFunds);
            StyleData(ws.Cell(r, 10), row.EstimatedBudget);
            ws.Cell(r, 10).Style.NumberFormat.Format = "#,##0.00";
            StyleData(ws.Cell(r, 11), row.AttachedSupportingDocuments);
            StyleData(ws.Cell(r, 12), row.Remarks);
        }

        var totalRow = dataStartRow + request.Rows.Count;
        ws.Cell(totalRow, 9).Value                      = "TOTAL BUDGET:";
        ws.Cell(totalRow, 9).Style.Font.Bold            = true;
        ws.Cell(totalRow, 9).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;
        ws.Cell(totalRow, 10).FormulaA1                 =
            $"=SUM(J{dataStartRow}:J{dataStartRow + request.Rows.Count - 1})";
        ws.Cell(totalRow, 10).Style.Font.Bold           = true;
        ws.Cell(totalRow, 10).Style.NumberFormat.Format = "#,##0.00";

        var sigRow = totalRow + 3;
        for (var i = 0; i < request.Signatories.Count; i++)
            RenderSignatoryBlock(ws, sigRow, 1 + (i * 6), request.Signatories[i]);

        ws.Columns().AdjustToContents();
        using var ms = new MemoryStream();
        wb.SaveAs(ms);
        return Task.FromResult(ms.ToArray());  // ← was missing Task.FromResult
    }
}
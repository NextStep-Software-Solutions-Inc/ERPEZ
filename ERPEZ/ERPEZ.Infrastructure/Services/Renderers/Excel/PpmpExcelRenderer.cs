using ClosedXML.Excel;
using ERPEZ.Application.Features.Planning.Document.Commands.GeneratePPMP;
using ERPEZ.Domain.Enums;
using ERPEZ.Infrastructure.Services.Renderers.Excel.Base;

namespace ERPEZ.Infrastructure.Services.DocumentGeneration.Renderers.Excel;

internal sealed class PpmpExcelRenderer
    : BaseExcelRenderer, IDocumentRenderer<GeneratePpmpDocumentCommand>
{
    public DocumentType DocumentType => DocumentType.Ppmp;
    public ExportFormat Format       => ExportFormat.Excel;

    public async Task<byte[]> RenderAsync(
        GeneratePpmpDocumentCommand request,
        CancellationToken           cancellationToken = default)
    {
        using var wb = LoadTemplate("ppmp_template.xlsx");
        var ws = wb.Worksheet(1);

        ws.Cell("C2").Value = $"PROJECT PROCUREMENT MANAGEMENT PLAN (PPMP) NO. {request.PpmpNumber}";
        ws.Cell("C2").Style.Font.Bold = true;
        ws.Cell("C2").Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

        ws.Cell("D4").Value = request.IsIndicative ? "☑ INDICATIVE" : "☐ INDICATIVE";
        ws.Cell("F4").Value = request.IsFinal      ? "☑ FINAL"      : "☐ FINAL";
        ws.Cell("A6").Value = $"Fiscal Year: {request.FiscalYear}";
        ws.Cell("A7").Value = $"End-User or Implementing Unit: {request.EndUserOrImplementingUnit}";

        const int dataStartRow = 11;
        for (var i = 0; i < request.Items.Count; i++)
        {
            var item = request.Items[i];
            var row  = dataStartRow + i;
            StyleData(ws.Cell(row, 1),  item.GeneralDescription);
            StyleData(ws.Cell(row, 2),  item.TypeOfProject);
            StyleData(ws.Cell(row, 3),  item.QuantityAndSize);
            StyleData(ws.Cell(row, 4),  item.ModeOfProcurement);
            StyleData(ws.Cell(row, 5),  item.PreProcurementConference ? "Yes" : "No");
            StyleData(ws.Cell(row, 6),  item.StartOfProcurement);
            StyleData(ws.Cell(row, 7),  item.EndOfProcurement);
            StyleData(ws.Cell(row, 8),  item.ExpectedDeliveryPeriod);
            StyleData(ws.Cell(row, 9),  item.SourceOfFunds);
            StyleData(ws.Cell(row, 10), item.EstimatedBudget);
            ws.Cell(row, 10).Style.NumberFormat.Format = "#,##0.00";
            StyleData(ws.Cell(row, 11), item.AttachedDocuments);
            StyleData(ws.Cell(row, 12), item.Remarks);
        }

        var totalRow = dataStartRow + request.Items.Count;
        ws.Cell(totalRow, 9).Value                    = "TOTAL BUDGET:";
        ws.Cell(totalRow, 9).Style.Font.Bold          = true;
        ws.Cell(totalRow, 9).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;
        ws.Cell(totalRow, 10).FormulaA1               =
            $"=SUM(J{dataStartRow}:J{dataStartRow + request.Items.Count - 1})";
        ws.Cell(totalRow, 10).Style.Font.Bold          = true;
        ws.Cell(totalRow, 10).Style.NumberFormat.Format = "#,##0.00";

        var sigRow = totalRow + 3;
        for (var i = 0; i < request.Signatories.Count; i++)
            RenderSignatoryBlock(ws, sigRow, 1 + (i * 6), request.Signatories[i]);

        ws.Columns().AdjustToContents();
        using var ms = new MemoryStream();
        wb.SaveAs(ms);
        return ms.ToArray();
    }
}
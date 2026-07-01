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
        WfpDataDto         request,
        CancellationToken  cancellationToken = default)
    {
        using var wb = LoadTemplate("wfp_template.xlsx");
        var ws = wb.Worksheet(1);

        ws.Cell("A4").Value = $"Project Title: {request.ProjectTitle}";
        ws.Cell("A4").Style.Font.Bold = true;
        ws.Cell("A5").Value = $"Project Duration (no. of months): {request.DurationMonths}";
        ws.Cell("D5").Value = $"Project Start Date: {request.ProjectStartDate:MMMM dd, yyyy}";
        ws.Cell("G5").Value = $"Project End Date: {request.ProjectEndDate:MMM dd, yyyy}";
        ws.Cell("A6").Value = request.OfficeName;

        var currentRow = 9;

        foreach (var objective in request.Objectives)
        {
            var objectiveStartRow = currentRow;

            if (objective.Activities.Count == 0)
            {
                StyleData(ws.Cell(currentRow, 1), objective.ObjectiveText);
                currentRow++;
                continue;
            }

            foreach (var activity in objective.Activities)
            {
                if (!string.IsNullOrEmpty(activity.GroupHeader))
                {
                    ws.Cell(currentRow, 2).Value           = activity.GroupHeader;
                    ws.Cell(currentRow, 2).Style.Font.Bold = true;
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

            if (currentRow - 1 > objectiveStartRow)
                ws.Range(objectiveStartRow, 1, currentRow - 1, 1).Merge();

            StyleData(ws.Cell(objectiveStartRow, 1), objective.ObjectiveText);
            ws.Cell(objectiveStartRow, 1).Style.Alignment.Vertical = XLAlignmentVerticalValues.Top;
        }

        var sigRow = currentRow + 2;
        for (var i = 0; i < request.Signatories.Count; i++)
            RenderSignatoryBlock(ws, sigRow, 1 + (i * 4), request.Signatories[i]);

        ws.Columns().AdjustToContents();
        using var ms = new MemoryStream();
        wb.SaveAs(ms);
        return ms.ToArray();
    }
}

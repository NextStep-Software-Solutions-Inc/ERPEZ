using ClosedXML.Excel;
using ERPEZ.Application.Common.Dtos;

namespace ERPEZ.Infrastructure.Services.Renderers.Excel.Base;

internal abstract class BaseExcelRenderer
{
    protected XLWorkbook LoadTemplate(string resourceName)
    {
        var assembly = typeof(BaseExcelRenderer).Assembly;
        var fullName = assembly.GetManifestResourceNames()
            .FirstOrDefault(n => n.EndsWith(resourceName, StringComparison.OrdinalIgnoreCase))
            ?? throw new FileNotFoundException($"Embedded template '{resourceName}' not found.");

        using var stream = assembly.GetManifestResourceStream(fullName)!;
        return new XLWorkbook(stream);
    }

    protected static byte[]? LoadDefaultLogo()
    {
        var assembly = typeof(BaseExcelRenderer).Assembly;
        var name = assembly.GetManifestResourceNames()
            .FirstOrDefault(n => n.EndsWith("default_logo.png", StringComparison.OrdinalIgnoreCase));
        if (name is null) return null;
        using var stream = assembly.GetManifestResourceStream(name)!;
        using var ms = new MemoryStream();
        stream.CopyTo(ms);
        return ms.ToArray();
    }

    protected static void InjectLogo(IXLWorksheet ws, byte[]? logoBytes)
    {
        var bytes = logoBytes ?? LoadDefaultLogo();
        if (bytes is not { Length: > 0 }) return;
        using var ms = new MemoryStream(bytes);
        ws.AddPicture(ms).MoveTo(ws.Cell("A1")).WithSize(120, 60);
    }

    protected static void StyleHeader(IXLCell cell, string text)
    {
        cell.Value = text;
        cell.Style.Font.Bold                 = true;
        cell.Style.Font.FontSize             = 9;
        cell.Style.Alignment.Horizontal      = XLAlignmentHorizontalValues.Center;
        cell.Style.Alignment.Vertical        = XLAlignmentVerticalValues.Center;
        cell.Style.Alignment.WrapText        = true;
        cell.Style.Fill.BackgroundColor      = XLColor.FromHtml("#D9D9D9");
        cell.Style.Border.OutsideBorder      = XLBorderStyleValues.Thin;
    }

    protected static void StyleData(IXLCell cell, object? value = null)
    {
        if (value is not null) cell.Value = XLCellValue.FromObject(value);
        cell.Style.Font.FontSize        = 8;
        cell.Style.Alignment.WrapText   = true;
        cell.Style.Alignment.Vertical   = XLAlignmentVerticalValues.Top;
        cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
    }

    protected static void RenderSignatoryBlock(
        IXLWorksheet ws, int startRow, int startCol, SignatoryDto sig)
    {
        ws.Cell(startRow,     startCol).Value = sig.Label;
        ws.Cell(startRow + 3, startCol).Value = "Signature over Printed Name";
        ws.Cell(startRow + 4, startCol).Value = sig.PrintedName;
        ws.Cell(startRow + 5, startCol).Value = sig.Position;
        ws.Cell(startRow + 6, startCol).Value = sig.Designation;
        ws.Cell(startRow + 7, startCol).Value = $"Date: {sig.Date?.ToString("MM/dd/yyyy") ?? ""}";
        ws.Cell(startRow + 3, startCol).Style.Border.BottomBorder = XLBorderStyleValues.Thin;
    }
}
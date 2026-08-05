using ERPEZ.Application.Common.Dtos;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace ERPEZ.Infrastructure.Services.Renderers.Pdf.Base;

internal abstract class BasePdfRenderer
{
    protected static byte[]? LoadDefaultLogo()
    {
        var assembly = typeof(BasePdfRenderer).Assembly;
        var name = assembly.GetManifestResourceNames()
            .FirstOrDefault(n => n.EndsWith("default_logo.png", StringComparison.OrdinalIgnoreCase));
        if (name is null) return null;
        using var stream = assembly.GetManifestResourceStream(name)!;
        using var ms = new MemoryStream();
        stream.CopyTo(ms);
        return ms.ToArray();
    }

    protected static IContainer TableHeaderCell(IContainer c) =>
        c.Border(1).BorderColor(Colors.Grey.Medium).Background(Colors.Grey.Lighten2).Padding(3);

    protected static IContainer TableDataCell(IContainer c) =>
        c.Border(1).BorderColor(Colors.Grey.Medium).Padding(3);

    protected static void RenderSignatories(ColumnDescriptor col, List<SignatoryDto> signatories)
    {
        col.Item().PaddingTop(20).Row(row =>
        {
            foreach (var sig in signatories)
            {
                row.RelativeItem().Column(sc =>
                {
                    sc.Item().Text(sig.Label).Bold().FontSize(9);
                    sc.Item().PaddingTop(24).MaxWidth(160).BorderBottom(1).BorderColor(Colors.Black).Text("");
                    sc.Item().Text("Signature over Printed Name").FontSize(7).Italic();
                    sc.Item().Text(sig.PrintedName).Bold().FontSize(9);
                    sc.Item().Text(sig.Position).FontSize(8);
                    sc.Item().Text(sig.Designation).FontSize(8).Italic();
                    sc.Item().Text($"Date: {sig.Date?.ToString("MM/dd/yyyy") ?? ""}").FontSize(8);
                });
            }
        });
    }
}
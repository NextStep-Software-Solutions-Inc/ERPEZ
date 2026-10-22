using ERPEZ.Application.Common.Dtos;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace ERPEZ.Infrastructure.Services.Renderers.Pdf.Base;

public abstract class BasePdfRenderer
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

    protected static string CleanEntityName(string? rawName)
    {
        if (string.IsNullOrWhiteSpace(rawName)) return "Central Mindanao University";
        var trimmed = rawName.Trim();
        if (trimmed.Equals("USTP", StringComparison.OrdinalIgnoreCase) ||
            trimmed.Equals("Agency Name", StringComparison.OrdinalIgnoreCase) ||
            trimmed.Equals("[Agency Name]", StringComparison.OrdinalIgnoreCase) ||
            trimmed.Equals("PROCURING ENTITY", StringComparison.OrdinalIgnoreCase) ||
            trimmed.Equals("State Universities and Colleges (SUCs)", StringComparison.OrdinalIgnoreCase) ||
            trimmed.Equals("State Universities and Colleges", StringComparison.OrdinalIgnoreCase) ||
            trimmed.Equals("Cooperative Development Authority", StringComparison.OrdinalIgnoreCase) ||
            trimmed.Equals("[Head Office / Procuring Entity]", StringComparison.OrdinalIgnoreCase) ||
            trimmed.Equals("Head Office / Procuring Entity", StringComparison.OrdinalIgnoreCase) ||
            trimmed.Equals("[Name of Procuring Entity]", StringComparison.OrdinalIgnoreCase) ||
            trimmed.Equals("Name of Procuring Entity", StringComparison.OrdinalIgnoreCase) ||
            trimmed.Contains("SuperAdmin", StringComparison.OrdinalIgnoreCase) ||
            trimmed.Contains("Workspace", StringComparison.OrdinalIgnoreCase))
        {
            return "Central Mindanao University";
        }
        return trimmed;
    }

    /// <summary>
    /// Renders standard government agency letterhead with logo on the left (e.g. PO, PR, RFQ, APP, PPMP).
    /// Respects the organization's LetterheadAlignment preference (Default/Left/Center).
    /// </summary>
    protected static void RenderAgencyHeader(
        ColumnDescriptor col,
        string? procuringEntityName,
        string? procuringEntityAddress = null,
        byte[]? logoBytes = null,
        string? appendixText = null,
        string? documentTitle = null,
        string? documentSubtitle = null,
        bool showUnderline = true,
        float titleFontSize = 12.5f,
        string? alignment = null)
    {
        if (string.Equals(alignment, "Center", StringComparison.OrdinalIgnoreCase))
        {
            if (!string.IsNullOrWhiteSpace(appendixText))
            {
                col.Item().AlignRight().Text(appendixText).FontSize(8.5f).Italic();
            }

            RenderCenteredAgencyHeader(
                col,
                procuringEntityName,
                procuringEntityAddress,
                logoBytes,
                officeName: null,
                documentTitle: documentTitle,
                documentSubtitle: documentSubtitle,
                titleFontSize: titleFontSize,
                alignment: "Center");

            if (showUnderline && !string.IsNullOrWhiteSpace(documentTitle))
            {
                col.Item().PaddingTop(2).AlignCenter().MaxWidth(180).LineHorizontal(1.5f).LineColor(Colors.Black);
            }
            return;
        }

        if (!string.IsNullOrWhiteSpace(appendixText))
        {
            col.Item().AlignRight().Text(appendixText).FontSize(8.5f).Italic();
        }

        var entityName = CleanEntityName(procuringEntityName);

        if (logoBytes != null && logoBytes.Length > 0)
        {
            col.Item().Row(r =>
            {
                r.ConstantItem(48).Height(48).AlignMiddle().Image(logoBytes).FitArea();

                r.RelativeItem().PaddingLeft(12).AlignMiddle().Column(c =>
                {
                    c.Item().Text("Republic of the Philippines").FontSize(8f).FontColor(Colors.Grey.Darken2);
                    c.Item().Text(entityName).Bold().FontSize(11.5f);

                    if (!string.IsNullOrWhiteSpace(procuringEntityAddress))
                    {
                        c.Item().Text(procuringEntityAddress).FontSize(8f);
                    }
                });
            });
        }
        else
        {
            col.Item().AlignCenter().Text("Republic of the Philippines").FontSize(8f).FontColor(Colors.Grey.Darken2);
            col.Item().AlignCenter().Text(entityName).Bold().FontSize(11.5f);

            if (!string.IsNullOrWhiteSpace(procuringEntityAddress))
            {
                col.Item().AlignCenter().Text(procuringEntityAddress).FontSize(8f);
            }
        }

        if (!string.IsNullOrWhiteSpace(documentTitle))
        {
            col.Item().PaddingTop(6).AlignCenter().Text(documentTitle).Bold().FontSize(titleFontSize);

            if (!string.IsNullOrWhiteSpace(documentSubtitle))
            {
                col.Item().PaddingTop(1).AlignCenter().Text(documentSubtitle).FontSize(8.5f).Italic();
            }

            if (showUnderline)
            {
                col.Item().PaddingTop(2).AlignCenter().MaxWidth(180).LineHorizontal(1.5f).LineColor(Colors.Black);
            }
        }
    }

    /// <summary>
    /// Renders centered formal agency header with centered logo on top (e.g. NOA, NTP, Contract, BAC Resolution).
    /// Respects the organization's LetterheadAlignment preference (Default/Left/Center).
    /// </summary>
    protected static void RenderCenteredAgencyHeader(
        ColumnDescriptor col,
        string? procuringEntityName,
        string? procuringEntityAddress = null,
        byte[]? logoBytes = null,
        string? officeName = null,
        string? documentTitle = null,
        string? documentSubtitle = null,
        float titleFontSize = 13.5f,
        string? alignment = null)
    {
        if (string.Equals(alignment, "Left", StringComparison.OrdinalIgnoreCase))
        {
            var cleanLeftName = CleanEntityName(procuringEntityName);
            if (logoBytes != null && logoBytes.Length > 0)
            {
                col.Item().Row(r =>
                {
                    r.ConstantItem(48).Height(48).AlignMiddle().Image(logoBytes).FitArea();

                    r.RelativeItem().PaddingLeft(12).AlignMiddle().Column(c =>
                    {
                        c.Item().Text("Republic of the Philippines").FontSize(8f).FontColor(Colors.Grey.Darken2);
                        c.Item().Text(cleanLeftName).Bold().FontSize(11.5f);

                        if (!string.IsNullOrWhiteSpace(procuringEntityAddress))
                        {
                            c.Item().Text(procuringEntityAddress).FontSize(8f);
                        }

                        if (!string.IsNullOrWhiteSpace(officeName))
                        {
                            c.Item().Text(officeName).FontSize(8f);
                        }
                    });
                });
            }
            else
            {
                col.Item().Text("Republic of the Philippines").FontSize(8f).FontColor(Colors.Grey.Darken2);
                col.Item().Text(cleanLeftName).Bold().FontSize(11.5f);

                if (!string.IsNullOrWhiteSpace(procuringEntityAddress))
                {
                    col.Item().Text(procuringEntityAddress).FontSize(8f);
                }

                if (!string.IsNullOrWhiteSpace(officeName))
                {
                    col.Item().Text(officeName).FontSize(8f);
                }
            }

            col.Item().PaddingTop(4).LineHorizontal(0.5f).LineColor(Colors.Grey.Lighten1);

            if (!string.IsNullOrWhiteSpace(documentTitle))
            {
                col.Item().PaddingTop(10).AlignCenter()
                    .Text(documentTitle)
                    .Bold().FontSize(titleFontSize);

                if (!string.IsNullOrWhiteSpace(documentSubtitle))
                {
                    col.Item().PaddingTop(2).AlignCenter()
                        .Text(documentSubtitle)
                        .FontSize(9.5f).FontColor(Colors.Grey.Darken3);
                }
            }
            return;
        }

        if (logoBytes != null && logoBytes.Length > 0)
        {
            col.Item().AlignCenter().Height(44).Image(logoBytes).FitArea();
        }

        var entityName = CleanEntityName(procuringEntityName);

        col.Item().PaddingTop(1).AlignCenter()
            .Text("Republic of the Philippines")
            .FontSize(8.5f).FontColor(Colors.Grey.Darken2);

        col.Item().PaddingTop(1).AlignCenter()
            .Text(entityName)
            .Bold().FontSize(11f).FontColor(Colors.Grey.Darken4);

        if (!string.IsNullOrWhiteSpace(procuringEntityAddress))
        {
            col.Item().PaddingTop(1).AlignCenter()
                .Text(procuringEntityAddress)
                .FontSize(8f).FontColor(Colors.Grey.Darken2);
        }

        if (!string.IsNullOrWhiteSpace(officeName) &&
            !officeName.Contains("SuperAdmin", StringComparison.OrdinalIgnoreCase) &&
            !officeName.Contains("Cooperative Development Authority", StringComparison.OrdinalIgnoreCase) &&
            !officeName.Contains("State Universities and Colleges", StringComparison.OrdinalIgnoreCase) &&
            !officeName.Equals(entityName, StringComparison.OrdinalIgnoreCase))
        {
            col.Item().PaddingTop(1).AlignCenter()
                .Text(officeName)
                .FontSize(8.5f).FontColor(Colors.Grey.Darken2);
        }

        col.Item().PaddingTop(4).LineHorizontal(0.5f).LineColor(Colors.Grey.Lighten1);

        if (!string.IsNullOrWhiteSpace(documentTitle))
        {
            col.Item().PaddingTop(10).AlignCenter()
                .Text(documentTitle)
                .Bold().FontSize(titleFontSize);

            if (!string.IsNullOrWhiteSpace(documentSubtitle))
            {
                col.Item().PaddingTop(2).AlignCenter()
                    .Text(documentSubtitle)
                    .FontSize(9.5f).FontColor(Colors.Grey.Darken3);
            }
        }
    }

    protected static IContainer TableHeaderCell(IContainer c) =>
        c.Border(0.5f).BorderColor(Colors.Grey.Medium)
        .Background(Colors.Grey.Lighten2)
        .Padding(3)
        .AlignCenter()
        .AlignMiddle();

    protected static IContainer TableDataCell(IContainer c) =>
        c.Border(0.5f).BorderColor(Colors.Grey.Medium).Padding(3);

    protected static void RenderSignatories(ColumnDescriptor col, List<SignatoryDto> signatories)
    {
        col.Item().PaddingTop(20).Row(row =>
        {
            foreach (var sig in signatories)
            {
                row.RelativeItem().Column(sc =>
                {
                    sc.Item().Text(sig.Label).Bold().FontSize(9);
                    sc.Item().PaddingTop(24).MaxWidth(180).BorderBottom(1).BorderColor(Colors.Black).PaddingBottom(2)
                        .Text(sig.PrintedName).Bold().FontSize(9);
                    sc.Item().PaddingTop(2).Text("Signature over Printed Name").FontSize(7).Italic();
                    sc.Item().Text(sig.Position).FontSize(8);
                    if (!string.IsNullOrWhiteSpace(sig.Designation))
                        sc.Item().Text(sig.Designation).FontSize(8).Italic();
                    sc.Item().Text($"Date: {sig.Date?.ToString("MM/dd/yyyy") ?? ""}").FontSize(8);
                });
            }
        });
    }
}